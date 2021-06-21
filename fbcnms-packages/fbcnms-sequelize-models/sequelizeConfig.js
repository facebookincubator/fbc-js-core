/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {Options} from 'sequelize';
const fs = require('fs');
// TODO: Pull from shared config
const MYSQL_HOST = process.env.MYSQL_HOST || '127.0.0.1';
const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || '3306');
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASS = process.env.MYSQL_PASS || '';
const MYSQL_DB = process.env.MYSQL_DB || 'cxl';
const MYSQL_DIALECT = process.env.MYSQL_DIALECT || 'mysql';
const CA_FILE = process.env.CA_FILE;
const KEY_FILE = process.env.KEY_FILE;
const CERT_FILE = process.env.CERT_FILE;

const logger = require('@fbcnms/logging').getLogger(module);

let ssl_required = false;
let CAcert = process.env.CA_FILE;
let Ckey = process.env.KEY_FILE;
let Ccert = process.env.CERT_FILE;
let dialectOptions = {};

if (process.env.CA_FILE) {
  try {
    CAcert = fs.readFileSync(CA_FILE);
    ssl_required = true;
  } catch (e) {
    console.warn('cannot read ca cert file', e);
  }
}

if (process.env.KEY_FILE) {
  try {
    Ckey = fs.readFileSync(KEY_FILE);
    ssl_required = true;
  } catch (e) {
    console.warn('cannot read key file', e);
  }
}

if (process.env.CERT_FILE) {
  try {
    Ccert = fs.readFileSync(CERT_FILE);
    ssl_required = true;
  } catch (e) {
    console.warn('cannot read cert file', e);
  }
}

if (ssl_required) {
  dialectOptions = {
    ssl: {
      ca: CAcert,
      key: Ckey,
      cert: Ccert,
    },
  };
}

const config: {[string]: Options} = {
  test: {
    username: '',
    password: '',
    database: 'db',
    dialect: 'sqlite',
    logging: false,
  },
  development: {
    username: MYSQL_USER,
    password: MYSQL_PASS,
    database: MYSQL_DB,
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    dialect: MYSQL_DIALECT,
    ssl: ssl_required,
    dialectOptions,
    logging: (msg: string) => logger.debug(msg),
  },
  production: {
    username: MYSQL_USER,
    password: MYSQL_PASS,
    database: MYSQL_DB,
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    dialect: MYSQL_DIALECT,
    ssl: ssl_required,
    dialectOptions,
    logging: (msg: string) => logger.debug(msg),
  },
};

export default config;
