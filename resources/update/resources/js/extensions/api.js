import { send } from "../ws.js"
import { getMedia, getMusic } from "../functions.js"

export class api {
  constructor() {}

  async loadPosts(type='last', start_index=0) {
    return new Promise((resolve, reject) => {
        send({
            type: 'social',
            action: 'load_posts',
            payload: {
                posts_type: type,
                start_index: start_index
            }
        }, r => {
            if (r.status == 'error') { reject(new Error(r.message)) }
            r = r.posts
            r.forEach(post => {
                if (post.author.avatar) {
                    getMedia(post.author.avatar, blob => post.author.avatar = URL.createObjectURL(blob), null)
                }
                if (post.content) {
                    if (post.images) {
                        post.images.forEach(image => {
                            getMedia(image.img_data, blob => image.img_data = URL.createObjectURL(blob))
                        })
                    }
                }
                const send_comment = (text, attachements=[]) => {
                    return new Promise((resolve, reject) => {
                        send({
                            type: 'social',
                            action: 'comments/add',
                            payload: {
                                post_id: post.id,
                                text: text,
                                files: attachements
                            }
                        }, r => {
                            if (r.status == 'error') { reject(r.message); return }
                            resolve(r)
                        })
                    })
                }
                const delete_post = () => {
                    if (!post.my_post) { return }
                    return new Promise((resolve, reject) => {
                        send({
                            type: 'social',
                            action: 'posts/delete',
                            payload: {
                                post_id: post.id
                            }
                        }, r => {
                            if (r.status == 'error') { reject(r.message); return }
                            resolve(r)
                        })
                    })
                }
                post['like'] = () => {
                    return new Promise((resolve, reject) => {
                        send({
                            type: 'social',
                            action: 'posts/like',
                            payload: {
                                post_id: post.id
                            }
                        }, r => {
                            if (r.status == 'error') { reject(r.message); return }
                            resolve(r)
                        })
                    })
                }
                post['dislike'] = () => {
                    return new Promise((resolve, reject) => {
                        send({
                            type: 'social',
                            action: 'posts/dislike',
                            payload: {
                                post_id: post.id
                            }
                        }, r => {
                            if (r.status == 'error') { reject(r.message); return }
                            resolve(r)
                        })
                    })
                }
                post['sendComment'] = send_comment
                post['delete'] = delete_post
            })
            resolve(r)
        })
    })
  }

  async loadmusic(type='favorites', start_index=0) {
    return new Promise((resolve, reject) => {
        send({
            type: 'social',
            action: 'load_songs',
            startIndex: start_index,
            songs_type: type
        }, r => {
            if (r.status == 'error') { reject(new Error(r.message)) }
            r = r.songs
            r.forEach(song => {
                if (song.cover) {
                    getMedia(song.cover, blob => song.cover = URL.createObjectURL(blob))
                }
                getMusic(song.id, blob => song.file = URL.createObjectURL(blob))
                song['like'] = () => {
                    return new Promise((resolve, reject) => {
                        send({
                            type: 'social',
                            action: 'music/like',
                            song_id: song.id
                        }, r => {
                            if (r.status == 'error') { reject(r.message); return }
                            resolve(r)
                        })
                    })
                }
            })
            resolve(r)
        })
    })
  }

  async profile(username) {
    return new Promise((resolve, reject) => {
        send({
            type: 'social',
            action: 'get_profile',
            username: username
        }, r => {
            if (r.status == 'error') { reject(new Error(r.message)) }
            getMedia(r.data.avatar, blob => r.data.avatar = URL.createObjectURL(blob))
            getMedia(r.data.cover, blob => r.data.cover = URL.createObjectURL(blob))
            resolve({
                profile: r.data,
                subscribe: () => {}
            })
        })
    })
  }

  async gold_code(code) {
    return new Promise((resolve, reject) => {
        send({
            type: 'social',
            action: "gold_activate",
            code: code
        }, (r) => {
            if (r.status == 'error') { reject(new Error(r.message)) }
            document.querySelector('#gold').querySelector('#form').classList.toggle('open')
            document.querySelector('#gold').querySelector('#form').classList.toggle('close')
        })
        send({
            type: 'social',
            action: 'get_profile',
            username: username
        }, r => {
            getMedia(r.data.avatar, blob => r.data.avatar = URL.createObjectURL(blob))
            getMedia(r.data.cover, blob => r.data.cover = URL.createObjectURL(blob))
            resolve({
                profile: r.data,
                subscribe: () => {}
            })
        })
    })
  }
}

