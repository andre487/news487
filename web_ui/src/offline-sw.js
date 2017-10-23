import {onInstall, onActivate} from '../service-worker/core';
import onFetch from '../service-worker/network';

self.addEventListener('install', onInstall);

self.addEventListener('activate', onActivate);

self.addEventListener('fetch', onFetch);
