#!/bin/bash
cd /home/kavia/workspace/code-generation/polylingo-live-57320-31584210/polylingo_live
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

