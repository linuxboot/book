build:
	mdbook build

run:
	mdbook serve

linkcheck:
	mdbook-linkcheck

prepare:
	cargo install mdbook
	cargo install mdbook-mermaid
	mdbook-mermaid install
	cargo install mdbook-linkcheck
