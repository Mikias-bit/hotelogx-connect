import { pmsService } from '../services/pmsService.js';

export const checkAvailability = async (args) => {
  const isAvailable = await pmsService.checkAvailability(args.service, args.date);
  return isAvailable 
    ? { success: true, message: `Available for ${args.service}.` }
    : { success: false, message: `Sorry, ${args.service} is not available.` };
};
