#!/usr/bin/env bash

set -ex
indexer --all
searchd --nodetach
