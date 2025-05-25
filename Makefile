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
