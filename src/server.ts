/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import chalk from 'chalk';
import { Server } from 'socket.io';
import app from './app';
import config from './config';
import { socketHelper } from './helpers/socketHelper';
import { errorLogger, logger } from './shared/logger';
import seedAdmin from './DB';
import { prisma } from '@/util/db';


process.on('uncaughtException', error => {
  errorLogger.error('Uncaught Exception Detected', error);
  process.exit(1);
});

let server: any;



async function main() {
  try {
   
    await prisma.$connect();
    logger.info(chalk.green('🚀 Database connected successfully'));

    // seed admin
    await seedAdmin();

   

    const port =
      typeof config.port === 'number' ? config.port : Number(config.port);

    server = app.listen(port, config.ip_address as string, () => {
      logger.info(
        chalk.yellow(`♻️ Application listening on port: ${config.port}`),
      );
    });

    // socket setup
    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: '*',
      },
    });

    socketHelper.socket(io);

    //@ts-ignore
    global.io = io;

  } catch (error) {
    errorLogger.error(chalk.red('🤢 Failed to start server'), error);
    process.exit(1);
  }
}

main();



// process.on('unhandledRejection', error => {
//   errorLogger.error('Unhandled Rejection Detected', error);

//   if (server) {
//     server.close(async () => {
//       await prisma.$disconnect();
//       process.exit(1);
//     });
//   } else {
//     process.exit(1);
//   }
// });



process.on('SIGTERM', async () => {
  logger.info('SIGTERM received');

  if (server) {
    server.close();
  }

  await prisma.$disconnect();
});