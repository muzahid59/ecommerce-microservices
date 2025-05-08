import { Express, Request, Response } from 'express';
import config from './config.json';
import axios from 'axios';

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
          ...req.headers,
          origin: 'http://localhost:8081',
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

export const configureRoutes = (app: Express) => {
  Object.entries(config.services).forEach(([name, service]) => {
     const hostName = service.url;
     service.routes.forEach((route) => {
      route.methods.forEach((method) => {
        const handler = createHandler(hostName, route.path, method);
        (app as any)[method](`/api${route.path}`, handler);
      });
     });
  });
}