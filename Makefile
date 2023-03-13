all:
	make prepare
	make linux
	make macos
	make windows
	make webapp
	make pack

prepare:
	rm -f mattermost-audiofile-plugin.tar.gz
	rm -rf mattermost-audiofile-plugin
	mkdir -p mattermost-audiofile-plugin
	mkdir -p mattermost-audiofile-plugin/client
	mkdir -p mattermost-audiofile-plugin/server

linux:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o mattermost-audiofile-plugin/server/plugin-linux-amd64 server/plugin.go

macos:
	CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -o mattermost-audiofile-plugin/server/plugin-darwin-amd64 server/plugin.go

windows:
	CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o mattermost-audiofile-plugin/server/plugin-windows-amd64 server/plugin.go

webapp:
	mkdir -p dist
	npm install
	./node_modules/.bin/webpack --mode=production

pack:
	cp -r dist/main.js mattermost-audiofile-plugin/client
	cp plugin.json mattermost-audiofile-plugin/
	tar -czvf mattermost-audiofile-plugin.tar.gz mattermost-audiofile-plugin
