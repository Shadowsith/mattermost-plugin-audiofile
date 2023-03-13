import React from 'react';
import axios from 'axios';
import { renderToStaticMarkup } from 'react-dom/server';

class PluginSettings {
    constructor(data) {
        /**
         * @type {number}
         */
        this.width = data.width == null ? 350 : data.width;
        /**
         * @type {number}
         */
        this.renderTimeout = data.renderTimeout == null ? 20 : data.renderTimeout;
        /**
         * @type {boolean}
         */
        this.mp3 = data.mp3 == null ? true : data.mp3;
        /**
         * @type {boolean}
         */
        this.m4a = data.m4a == null ? true : data.m4a;
        /**
         * @type {boolean}
         */
        this.ogg = data.ogg == null ? true : data.ogg;
        /**
         * @type {boolean}
         */
        this.oga = data.oga == null ? true : data.oga;
        /**
         * @type {boolean}
         */
        this.wav = data.wav == null ? true : data.wav;
        /**
         * @type {string[]}
         */
        this.supportedFileTypes = [
            'mp3',
            'm4a',
            'ogg',
            'oga',
            'wav'
        ];
    }
}


class PostMessageAttachmentComponent extends React.Component {
    static plugin;
    /**
     * @type {PluginSettings}
     */
    static settings;

    constructor(props) {
        super(props);
        this.postId = props.postId;
        this.msg = null;
        this.fileType = null;
        this.fileUrl = null;
        this.customId = null;
        this.postMessageId = this.postId + '_message';
        /**
         * @type {PluginSettings}
         */
        this.settings = PostMessageAttachmentComponent.settings;
    }

    render() {
        setTimeout(() => {
            this.afterRender();
        }, this.settings.renderTimeout);
        return (null);
    }

    /**
     * @returns {boolean}
     */
    isFilePostMessage() {
        if (this.msg.getElementsByClassName('post-image__details')[0] == null) {
            return false;
        }
        return true;
    }

    /**
     * @returns {string}
     */
    getFileType() {
        return this.msg.getElementsByClassName('post-image__type')[0]
            .innerHTML.toLowerCase().trim();
    }

    /**
     * @returns {boolean}
     */
    isRendered() {
        const parent = this.msg.parentElement;
        this.customId = this.postId + `_custom_${this.fileType}_audio_container`;
        if (parent.children[1] != null) {
            if (parent.children[1].id == customId) {
                return true;
            }
        }
        return false;
    }

    /**
     * @returns {string}
     */
    getFileUrl() {
        const a = this.msg.getElementsByTagName('a')[1];
        return a.href.replace('?download=1', '');
    }

    /**
     * @returns {HTMLDivElement}
     */
    getHtmlVideoElement() {
        let width = this.settings.width;
        try {
            if (PostMessageAttachmentComponent.plugin.props.maxHeight != null && width == null) {
                width = PostMessageAttachmentComponent.plugin.props.maxHeight;
            }
        } catch {
        }
        const css = `
                    .audiofile-mw {
                        min-width: ${width}px;
                        width: ${width}px;
                    }`;
        const node = document.createElement('div');
        node.setAttribute('id', this.customId);

        const fileType = this.getAudioUrlType(this.fileUrl);

        const html =
            <>
                <style>{css}</style>
                <audio controls class="audiofile-mw">
                    <source src={this.fileUrl} type={fileType} />
                </audio>
            </>;
        node.innerHTML = renderToStaticMarkup(html);
        return node;
    }

    /**
    * 
    * @param {string} url 
    * @returns {string}
    */
    getAudioUrlType(url) {
        try {
            const split = url.split('.');
            switch (split[split.length - 1]) {
                case 'mp3':
                    return 'audio/mpeg';

                case 'm4a':
                    return 'audio/m4a';

                case 'oga':
                case 'ogg':
                    return 'audio/ogg';

                case 'wav':
                    return 'audio/wav';

                default:
                    return 'audio/mpeg';
            }
        } catch {
            return 'audio/mpeg';
        }
    }

    /**
     * @returns void
     */
    afterRender() {
        /**
         * @type HTMLDivElement
         */
        this.msg = document.getElementById(this.postMessageId);
        try {
            if (!this.isFilePostMessage()) {
                return;
            }
            this.fileType = this.getFileType();
            if (!this.settings.supportedFileTypes.includes(this.fileType)) {
                return;
            }
            for (const ft of this.settings.supportedFileTypes) {
                if (this.fileType == ft && !this.settings[ft]) {
                    return;
                }
            }
            if (this.isRendered()) {
                return;
            }
            this.fileUrl = this.getFileUrl();
            this.msg.parentElement.append(this.getHtmlVideoElement());
        } catch (err) {
            console.log('err', err);
        }
    }

}


class AudioFilePlugin {
    static apiUrl = '/plugins/audiofile';

    initialize(registry, store) {
        const plugin = store.getState().plugins.plugins.audiofile;
        PostMessageAttachmentComponent.plugin = plugin;
        axios.get(`${AudioFilePlugin.apiUrl}/settings`)
            .then(res => {
                /**
                 * @type {PluginSettings}
                 */
                const settings = new PluginSettings(res.data);
                PostMessageAttachmentComponent.settings = settings;
                registry.registerPostMessageAttachmentComponent(
                    PostMessageAttachmentComponent
                );
            })
            .catch(err => {
                /**
                 * @type {PluginSettings}
                 */
                const settings = new PluginSettings();
                PostMessageAttachmentComponent.settings = settings;
                registry.registerPostMessageAttachmentComponent(
                    PostMessageAttachmentComponent
                );
            });
    }

    uninitialize() {
        // No clean up required.
    }
}

window.registerPlugin('audiofile', new AudioFilePlugin());