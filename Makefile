MARKDOWNLINT ?= markdownlint-cli2

build: book i18n
	# linkcheck causes output files to end up in html/, so move them to root
	mv book/html/* book/

i18n:
	bash i18n.sh

book:
	mdbook build

run:
	mdbook serve

prepare_i18n:
	cargo install mdbook-i18n-helpers --locked --version 0.3.4

prepare: prepare_i18n
	cargo install mdbook
	cargo install mdbook-mermaid
	mdbook-mermaid install
	cargo install mdbook-linkcheck

lint_install:
	npm i -g --prefix ~/bin/node/ markdownlint-cli2

# keep in sync with .github/workflows/markdownlint.yml
SHAMELIST := '!src/{case_studies/TiogaPass,coreboot.u-root.systemboot/index,utilities/dut,utilities/UEFI_Tool_Kit}.md'

lint:    ARGS =
lintfix: ARGS = --fix
lint lintfix:
	# NOTE: SUMMARY.md is the ToC, which has no headline
	$(MARKDOWNLINT) $(ARGS) 'src/**/*.md' !src/SUMMARY.md $(SHAMELIST)
