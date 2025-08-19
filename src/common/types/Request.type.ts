import { Request as ExpressRequest } from 'express';

export type Request = ExpressRequest & { user: { id: number } };
