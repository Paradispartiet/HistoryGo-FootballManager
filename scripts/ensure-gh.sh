#!/usr/bin/env bash

set -euo pipefail

GH_VERSION="${GH_VERSION:-2.97.0}"
GH_INSTALL_ROOT="${GH_INSTALL_ROOT:-/workspace}"
GH_BIN_DIR="${GH_BIN_DIR:-${GH_INSTALL_ROOT}/bin}"
GH_CONFIG_DIR="${GH_CONFIG_DIR:-${GH_INSTALL_ROOT}/gh-config}"

if command -v gh >/dev/null 2>&1; then
  gh --version | sed -n '1p'
  exit 0
fi

if [[ -x "${GH_BIN_DIR}/gh" ]]; then
  "${GH_BIN_DIR}/gh" --version | sed -n '1p'
  exit 0
fi

case "$(uname -s)" in
  Linux) platform="linux" ;;
  *)
    echo "ensure-gh: støtter foreløpig bare Linux-runtime." >&2
    exit 1
    ;;
esac

case "$(uname -m)" in
  x86_64|amd64) architecture="amd64" ;;
  aarch64|arm64) architecture="arm64" ;;
  *)
    echo "ensure-gh: ukjent arkitektur: $(uname -m)" >&2
    exit 1
    ;;
esac

archive="gh_${GH_VERSION}_${platform}_${architecture}.tar.gz"
release_url="https://github.com/cli/cli/releases/download/v${GH_VERSION}"
temporary_dir="$(mktemp -d "${TMPDIR:-/tmp}/ensure-gh.XXXXXX")"

cleanup() {
  rm -rf -- "${temporary_dir}"
}
trap cleanup EXIT

curl --fail --silent --show-error --location \
  "${release_url}/gh_${GH_VERSION}_checksums.txt" \
  --output "${temporary_dir}/checksums.txt"
curl --fail --silent --show-error --location \
  "${release_url}/${archive}" \
  --output "${temporary_dir}/${archive}"

expected_checksum="$(awk -v archive="${archive}" '$2 == archive { print $1 }' "${temporary_dir}/checksums.txt")"
if [[ -z "${expected_checksum}" ]]; then
  echo "ensure-gh: fant ikke checksum for ${archive}." >&2
  exit 1
fi

printf '%s  %s\n' "${expected_checksum}" "${temporary_dir}/${archive}" | sha256sum --check --status
tar --no-same-owner --extract --gzip --file "${temporary_dir}/${archive}" --directory "${temporary_dir}"

install -d "${GH_BIN_DIR}" "${GH_CONFIG_DIR}"
install -m 0755 \
  "${temporary_dir}/gh_${GH_VERSION}_${platform}_${architecture}/bin/gh" \
  "${GH_BIN_DIR}/gh"

"${GH_BIN_DIR}/gh" --version | sed -n '1p'
echo "ensure-gh: installert og verifisert i ${GH_BIN_DIR}/gh"
