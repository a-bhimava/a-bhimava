#!/usr/bin/env bash

set -euo pipefail

readonly repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly source_dir="${repo_root}/assets/readme/source"
readonly output_path="${repo_root}/assets/readme/project-carousel.gif"
readonly canvas_width=1200
readonly canvas_height=675
readonly frame_rate=18
readonly hold_duration=3.166667
readonly transition_duration=0.833333
readonly frame_count=288
readonly max_file_size=9000000

for command in ffmpeg ffprobe qlmanage; do
  command -v "${command}" >/dev/null || {
    echo "Missing required command: ${command}" >&2
    exit 1
  }
done

readonly work_dir="$(mktemp -d "${TMPDIR:-/tmp}/readme-carousel.XXXXXX")"
trap 'rm -rf "${work_dir}"' EXIT

slides=(
  carousel-01-projectsyard
  carousel-02-business-360
  carousel-03-credit-audit
  carousel-04-chronos
)

for slide in "${slides[@]}"; do
  qlmanage -t -s "${canvas_width}" -o "${work_dir}" "${source_dir}/${slide}.svg" >/dev/null
  ffmpeg -hide_banner -loglevel error -y \
    -i "${work_dir}/${slide}.svg.png" \
    -vf "crop=${canvas_width}:${canvas_height}:0:0" \
    -frames:v 1 "${work_dir}/${slide}.png"
done

render_gif() {
  local palette_size="$1"
  local output_size="$2"
  local candidate="$3"
  local scale_filter=""

  if [[ -n "${output_size}" ]]; then
    scale_filter=",scale=${output_size}:flags=lanczos"
  fi

  ffmpeg -hide_banner -loglevel error -y \
    -loop 1 -framerate "${frame_rate}" -t "${hold_duration}" -i "${work_dir}/${slides[0]}.png" \
    -loop 1 -framerate "${frame_rate}" -t "${hold_duration}" -i "${work_dir}/${slides[1]}.png" \
    -loop 1 -framerate "${frame_rate}" -t "${hold_duration}" -i "${work_dir}/${slides[2]}.png" \
    -loop 1 -framerate "${frame_rate}" -t "${hold_duration}" -i "${work_dir}/${slides[3]}.png" \
    -loop 1 -framerate "${frame_rate}" -t "${transition_duration}" -i "${work_dir}/${slides[0]}.png" \
    -loop 1 -framerate "${frame_rate}" -t "${transition_duration}" -i "${work_dir}/${slides[1]}.png" \
    -loop 1 -framerate "${frame_rate}" -t "${transition_duration}" -i "${work_dir}/${slides[1]}.png" \
    -loop 1 -framerate "${frame_rate}" -t "${transition_duration}" -i "${work_dir}/${slides[2]}.png" \
    -loop 1 -framerate "${frame_rate}" -t "${transition_duration}" -i "${work_dir}/${slides[2]}.png" \
    -loop 1 -framerate "${frame_rate}" -t "${transition_duration}" -i "${work_dir}/${slides[3]}.png" \
    -loop 1 -framerate "${frame_rate}" -t "${transition_duration}" -i "${work_dir}/${slides[3]}.png" \
    -loop 1 -framerate "${frame_rate}" -t "${transition_duration}" -i "${work_dir}/${slides[0]}.png" \
    -filter_complex "color=c=0x0B0D12:s=${canvas_width}x${canvas_height}:r=${frame_rate}:d=${transition_duration}[bg_ab];color=c=0x0B0D12:s=${canvas_width}x${canvas_height}:r=${frame_rate}:d=${transition_duration}[bg_bc];color=c=0x0B0D12:s=${canvas_width}x${canvas_height}:r=${frame_rate}:d=${transition_duration}[bg_cd];color=c=0x0B0D12:s=${canvas_width}x${canvas_height}:r=${frame_rate}:d=${transition_duration}[bg_da];[bg_ab][4:v]overlay=x='-(W+12)*(1-pow(1-min(t/${transition_duration},1),3))':y=0:shortest=1:eval=frame[ab_out];[ab_out][5:v]overlay=x='(W+12)*pow(1-min(t/${transition_duration},1),3)':y=0:shortest=1:eval=frame[ab];[bg_bc][6:v]overlay=x='-(W+12)*(1-pow(1-min(t/${transition_duration},1),3))':y=0:shortest=1:eval=frame[bc_out];[bc_out][7:v]overlay=x='(W+12)*pow(1-min(t/${transition_duration},1),3)':y=0:shortest=1:eval=frame[bc];[bg_cd][8:v]overlay=x='-(W+12)*(1-pow(1-min(t/${transition_duration},1),3))':y=0:shortest=1:eval=frame[cd_out];[cd_out][9:v]overlay=x='(W+12)*pow(1-min(t/${transition_duration},1),3)':y=0:shortest=1:eval=frame[cd];[bg_da][10:v]overlay=x='-(W+12)*(1-pow(1-min(t/${transition_duration},1),3))':y=0:shortest=1:eval=frame[da_out];[da_out][11:v]overlay=x='(W+12)*pow(1-min(t/${transition_duration},1),3)':y=0:shortest=1:eval=frame[da];[0:v][ab][1:v][bc][2:v][cd][3:v][da]concat=n=8:v=1:a=0,fps=${frame_rate}${scale_filter},split[gif][palette];[palette]palettegen=max_colors=${palette_size}:stats_mode=full[p];[gif][p]paletteuse=dither=bayer:bayer_scale=4" \
    -frames:v "${frame_count}" -gifflags +offsetting+transdiff -loop 0 "${candidate}"
}

candidate="${work_dir}/project-carousel.gif"
render_gif 192 "" "${candidate}"

if (( $(wc -c < "${candidate}") > max_file_size )); then
  render_gif 160 "" "${candidate}"
fi

if (( $(wc -c < "${candidate}") > max_file_size )); then
  render_gif 160 "1120:630" "${candidate}"
fi

mv "${candidate}" "${output_path}"
ffprobe -v error -count_frames \
  -show_entries stream=width,height,nb_read_frames,r_frame_rate \
  -of default=noprint_wrappers=1 "${output_path}"
printf 'Wrote %s (%s bytes)\n' "${output_path}" "$(wc -c < "${output_path}")"
