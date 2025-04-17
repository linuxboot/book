#!/usr/bin/env bash

declare -A shame_list
shame_list=(
    [./src/case_studies/TiogaPass.md]=1
    [./src/components.md]=1
    [./src/coreboot.u-root.systemboot/index.md]=1
    [./src/faq.md]=1
    [./src/implementation.md]=1
    [./src/intro.md]=1
    [./src/naming.md]=1
    [./src/SUMMARY.md]=1
    [./src/talks-news.md]=1
    [./src/u-root.md]=1
    [./src/utilities/cpu.md]=1
    [./src/utilities/dut.md]=1
    [./src/utilities/UEFI_Tool_Kit.md]=1
)

ll_rv=0
for md_file in $(find . -name "*.md"); do
    if [[ "${shame_list[$md_file]}" ]]; then
        echo -e "\\e[93mSkipping ${md_file}\\e[0m"
    else
        echo "$ mdl ${md_file}"
        mdl ${md_file}

        mdl_rv="$?"
        if [[ "${mdl_rv}" -ne 0 ]]; then
            ll_rv="${mdl_rv}"
        fi
    fi
done
exit ${ll_rv}
