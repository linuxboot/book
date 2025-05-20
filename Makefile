build:
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
