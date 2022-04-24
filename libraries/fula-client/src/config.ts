// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import WebRTCStar from 'libp2p-webrtc-star';
import { NOISE, Noise } from '@chainsafe/libp2p-noise';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Mplex from 'libp2p-mplex';
import { constructorOptions, Libp2pOptions } from 'libp2p';
import { SIG_SERVER } from './constant';
import Protector from "libp2p/src/pnet/index.js"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import wrtc from 'wrtc';

const noise = new Noise();

const isNode = (typeof process !== 'undefined') && ("release" in process && process.release.name === 'node')


export async function configure(
  config = {}, netSecret=undefined
): Promise<Libp2pOptions & Partial<constructorOptions>> {
  const transportKey = WebRTCStar.prototype[Symbol.toStringTag]
  return {
    addresses: {
      listen: SIG_SERVER
    },
    modules: {
      transport: [WebRTCStar],
      streamMuxer: [Mplex],
      connEncryption: [NOISE],
      connProtector: netSecret?new Protector(netSecret):undefined
    },
    connectionManager: {
      autoDial: true,
      maxConnections: 1,
      minConnections: 1,
      pollInterval: 2000,
      defaultPeerValue: 1,
      // The below values will only be taken into account when Metrics are enabled
      maxData: Infinity,
      maxSentData: Infinity,
      maxReceivedData: Infinity,
      maxEventLoopDelay: Infinity,
      movingAverageInterval: 60000
    },
    config: {
      transport: {
        [transportKey]: {
          wrtc:isNode?wrtc:undefined // You can use `wrtc` when running in Node.js
        }
      },
      peerDiscovery: {
        autoDial: true,
        webRTCStar: {
          enabled: false
        }
      }
    },
    connectionGater: {
      denyInboundConnection: async ()=> true
    },
    ...config
  };
}
