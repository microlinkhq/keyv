/* eslint-disable no-new */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-invalid-void-type */

import Keyv = require('@keyvhq/core')
import KeyvMysql = require('..')

new Keyv({ store: new KeyvMysql({ uri: 'mysql://user:pass@localhost:3306/dbname', table: 'cache' }) })

new KeyvMysql({ uri: 'mysql://user:pass@localhost:3306/dbname' })
new KeyvMysql({ table: 'cache' })
new KeyvMysql({ keySize: 100 })

const mysql = new KeyvMysql({ uri: 'mysql://user:pass@localhost:3306/dbname' })
new Keyv({ store: mysql })
