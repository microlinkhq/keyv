'use strict';

const EventEmitter = require('events');
const Redis = require('ioredis');
const pify = require('pify');

class KeyvRedis extends EventEmitter {
	constructor(uri, options) {
		super();

		if (uri instanceof Redis) {
			this.redis = uri;
		} else {
			options = Object.assign({}, typeof uri === 'string' ? { uri } : uri, options);
			this.redis = new Redis(options.uri, options);
		}

		this.redis.on('error', error => this.emit('error', error));
	}

	_getNamespace() {
		return `namespace:${this.namespace}`;
	}

	get(key) {
		return this.redis.get(key)
			.then(value => {
				if (value === null) {
					return undefined;
				}

				return value;
			});
	}

	set(key, value, ttl) {
		if (typeof value === 'undefined') {
			return Promise.resolve(undefined);
		}

		return Promise.resolve()
			.then(() => {
				if (typeof ttl === 'number') {
					return this.redis.set(key, value, 'PX', ttl);
				}

				return this.redis.set(key, value);
			})
			.then(() => this.redis.sadd(this._getNamespace(), key));
	}

	delete(key) {
		return this.redis.del(key)
			.then(items => {
				return this.redis.srem(this._getNamespace(), key)
					.then(() => items > 0);
			});
	}

	clear() {
		return this.redis.smembers(this._getNamespace())
			.then(keys => this.redis.del(keys.concat(this._getNamespace())))
			.then(() => undefined);
	}

	async * iterator() {
		const scan = pify(this.redis.scan).bind(this.keyv.options.store.redis);

		async function * iterate(curs, pattern) {
			const [cursor, keys] = await scan(curs, 'MATCH', pattern);
			const values = this.redis.mget(keys);
			for (const i in keys) {
				if (Object.prototype.hasOwnProperty.call(keys, i)) {
					const key = keys[i];
					const value = values[i];
					yield [key, value];
				}
			}

			if (cursor !== '0') {
				yield * iterate(cursor, pattern);
			}
		}

		yield * iterate(0, `${this.keyv.options.namespace}:*`);
	}
}

module.exports = KeyvRedis;
