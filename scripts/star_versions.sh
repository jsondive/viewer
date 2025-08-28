#!/bin/bash

function update_dependency() {
  jq  ".dependencies.\"$2\" = \"*\"" $1 > $1.tmp
  mv $1.tmp $1
}

function update_dev_dependency() {
  jq  ".devDependencies.\"$2\" = \"*\"" $1 > $1.tmp
  mv $1.tmp $1
}

update_dependency packages/viewer/package.json @jsondive/library
update_dev_dependency packages/library/package.json @jsondive/shared-config
update_dev_dependency packages/viewer/package.json @jsondive/shared-config
