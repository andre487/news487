#!/usr/bin/env bash

set -ex

while true; do
    sleep 1800
    indexer --all --rotate
done
