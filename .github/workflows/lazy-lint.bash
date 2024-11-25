#!/usr/bin/env bash

shame_list=(
./src/case_studies/TiogaPass.md
./src/components.md
./src/coreboot.u-root.systemboot/index.md
./src/faq.md
./src/getting_started.md
./src/implementation.md
./src/intro.md
./src/naming.md
./src/SUMMARY.md
./src/u-root.md
./src/utilities/cpu.md
./src/utilities/dut.md
./src/utilities/UEFI_Tool_Kit.md
)

comm -3 <(find -name "*.md" | sort) <(printf "%s\n" "${shame_list[@]}" | sort)
