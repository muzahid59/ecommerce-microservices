import { Express, Request, Response } from 'express';
import config from './config.json';
import axios from 'axios';
import middlewares from './middlewares';

export const createHandler = (hostName: string, path: string, method: string) => {
  return async (req: Request, res: Response) => {
    try {
      let url = `${hostName}${path}`;
      req.params && Object.keys(req.params).forEach((key) => {
        url = url.replace(`:${key}`, req.params[key]);
      });
      const { data } = await axios({
        method,
        url: url,
        data: req.body,
        headers: {
          origin: 'http://localhost:8081',
          'x-user-id': req.headers['x-user-id'] || '',
          'x-user-email': req.headers['x-user-email'] || '',
          'x-user-name': req.headers['x-user-name'] || '',
          'x-user-role': req.headers['x-user-role'] || '',
          "user-agent": req.headers['user-agent'] || '',
        },
      });

      res.json(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const message = error.response?.data || 'Internal Server Error';
        return res.status(status).json({ message });
      } else {
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  }
}

export const getMiddlewares = (names: string[]) => {
  return names.map((name) => middlewares[name]);
}

export const configureRoutes = (app: Express) => {
  Object.entries(config.services).forEach(([name, service]) => {
     const hostName = service.url;
     service.routes.forEach((route) => {
      route.methods.forEach((method) => {
        const endpoint =`/api${route.path}`;
        const middlewares = getMiddlewares(route.middlewares);
        const handler = createHandler(hostName, route.path, method);
        (app as any)[method](endpoint, ...middlewares, handler);
      });
     });
  });
}