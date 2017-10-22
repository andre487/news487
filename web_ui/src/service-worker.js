import {onInstall, onActivate} from '../service-worker/core';
import onFetch from '../service-worker/network';
import onPush from '../service-worker/push';

self.addEventListener('install', onInstall);

self.addEventListener('activate', onActivate);

self.addEventListener('fetch', onFetch);

self.addEventListener('push', onPush);
