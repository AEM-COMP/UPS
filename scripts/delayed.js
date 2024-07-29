// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './aem.js';

async function delayed() {
  // Core Web Vitals RUM collection
  sampleRUM('cwv');

  // add more delayed functionality here
}

delayed();
