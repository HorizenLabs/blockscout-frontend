#!/bin/bash

set -eEuo pipefail

echo "=== Local variables ==="
PROD_RELEASE_BRANCH="${PROD_RELEASE_BRANCH:-main}"
DEV_RELEASE_BRANCH="${DEV_RELEASE_BRANCH:-development}"
IS_A_PROD_BUILD="${IS_A_PROD_BUILD:-false}"
IS_A_DEV_BUILD="${IS_A_DEV_BUILD:-false}"
DOCKER_IMAGE_NAME="${DOCKER_IMAGE_NAME:-horizenlabs/blockscout-frontend}"

# absolute path to project from relative location of this script
workdir="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." &> /dev/null && pwd )"
echo "=== Workdir: ${workdir} ==="

command -v docker &> /dev/null && have_docker="true" || have_docker="false"
echo "=== Have docker: ${have_docker} ==="

# Functions
function fn_die() {
  echo -e "$1" >&2
  exit "${2:-1}"
}

echo "=== Checking if Docker is installed ==="
if [ "${have_docker}" = "false" ]; then
  fn_die "Docker is not installed. Exiting ..."
fi

echo "=== Checking if GITHUB_TOKEN is set ==="
if [ -z "${GITHUB_TOKEN:-}" ]; then
  fn_die "GITHUB_TOKEN variable is not set. Exiting ..."
fi

echo "=== Checking if DOCKER_WRITER_PASSWORD is set ==="
if [ -z "${DOCKER_WRITER_PASSWORD:-}" ]; then
  fn_die "DOCKER_WRITER_PASSWORD variable is not set. Exiting ..."
fi

echo "=== Checking if DOCKER_WRITER_USERNAME is set ==="
if [ -z "${DOCKER_WRITER_USERNAME:-}" ]; then
  fn_die "DOCKER_WRITER_USERNAME variable is not set. Exiting ..."
fi


docker_tags=""
IS_A_DEV_BUILD="true"
if [ "${IS_A_RELEASE}" = "true" ]; then
  docker_tags="${TRAVIS_TAG},latest"
elif [ "${IS_A_PROD_BUILD}" = "true" ]; then
  docker_tags="latest"
elif [ "${IS_A_DEV_BUILD}" = "true" ]; then
  docker_tags="dev"
fi

echo "=== Docker tag(s) set to: ${docker_tags} ==="

if [ -z "${docker_tags}" ]; then
  echo "" && echo "=== Feature branch, no Docker image is generated ===" && echo ""
else
  echo "" && echo "=== Building and publishing docker image(s) ===" && echo ""
  echo "$DOCKER_WRITER_PASSWORD" | docker login -u "$DOCKER_WRITER_USERNAME" --password-stdin
  IFS=',' read -ra TAGS <<< "${docker_tags}"
  for tag in "${TAGS[@]}"; do
    docker build --build-arg GIT_COMMIT_SHA=$(git rev-parse --short HEAD) --build-arg GIT_TAG=$(git describe --tags --abbrev=0) -t "${DOCKER_IMAGE_NAME}:${tag}" .
    docker push "${DOCKER_IMAGE_NAME}:${tag}"
  done
fi

# If a release push Release to GitHub
if [ "${IS_A_RELEASE}" = "true" ]; then
  echo "" && echo "=== Generating Release ${TRAVIS_TAG} for ${TRAVIS_REPO_SLUG} ===" && echo ""
  curl -X POST -H "Accept: application/vnd.github+json" -H "Authorization: token ${GITHUB_TOKEN}" https://api.github.com/repos/"${TRAVIS_REPO_SLUG}"/releases -d "{\"tag_name\":\"${TRAVIS_TAG}\",\"generate_release_notes\":true}"
fi
