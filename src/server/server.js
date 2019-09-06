#!/usr/bin/env node
'use strict';

const Server = require('./helpers/server');
Server.initialize();

process.title = 'freeze-it-server';