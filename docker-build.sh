#!/bin/sh
# Copies ~/.npmrc into the build context, builds the Docker image, then removes it.
# The registry credentials never end up in the final image.
set -e

cleanup() { rm -f .npmrc; }
trap cleanup EXIT

cp ~/.npmrc .npmrc
docker build -t refinement-poker "$@" .
