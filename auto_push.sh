#!/bin/bash
cd /home/vincent/repos/sandbox
git add .
git commit -m "auto commit $(date +'%Y-%m-%d %H:%M:%S')"
git push origin main
