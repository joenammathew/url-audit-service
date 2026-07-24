import axios from 'axios';
import { AuditResult } from '../types';
import { logger } from '../middleware/logger';
import * as cheerio from 'cheerio'; // Wait! We need to install this

// First install cheerio: npm install cheerio
// I'll continue this in next section