import * as config from 'config';

import Server from './server'

const app = new Server(config.get('port'));

export default app