
website/node_modules/.bin/docusaurus-start:
	cd website && yarn install

.PHONY: doc
doc: website/node_modules/.bin/docusaurus-start
	cd website && yarn start


# install librsvg for this command
website/static/img/pvm-64-dark.png: website/static/img/pvm.svg
	cat $< | sed 's/#9ac348/#1B2304/g' | rsvg-convert > $@

website/static/img/pvm-64.png: website/static/img/pvm.svg
	rsvg-convert $< > $@
