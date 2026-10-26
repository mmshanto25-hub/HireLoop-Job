import type { Request, Response } from "express";
import {
  createCompanySchema,
  updateCompanySchema,
  reviewCompanySchema,
} from "@hireloop/shared";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/AppError.js";
import * as companyService from "../services/company.service.js";

export function createCompanyController() {
  return {
    listPublic: asyncHandler(async (req: Request, res: Response) => {
      const { q, industry, page, limit } = req.query;
      const result = await companyService.listApprovedCompanies({
        q: typeof q === "string" ? q : undefined,
        industry: typeof industry === "string" ? industry : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      sendSuccess(res, result.companies, {
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit) || 1,
          hasNextPage: result.page * result.limit < result.total,
          hasPreviousPage: result.page > 1,
        },
      });
    }),

    getBySlug: asyncHandler(async (req: Request, res: Response) => {
      const { slug } = req.params;
      if (!slug) throw AppError.notFound();

      const viewerUserId = req.auth?.userId;
      const isAdmin = req.auth?.user.roles.includes("admin") ?? false;

      const company = await companyService.getCompanyBySlug(slug, viewerUserId, isAdmin);
      sendSuccess(res, company);
    }),

    getMine: asyncHandler(async (req: Request, res: Response) => {
      if (!req.auth) throw AppError.unauthenticated();
      const company = await companyService.getRecruiterCompany(req.auth.userId);
      sendSuccess(res, company);
    }),

    register: asyncHandler(async (req: Request, res: Response) => {
      if (!req.auth) throw AppError.unauthenticated();
      const parsed = createCompanySchema.parse(req.body);
      const company = await companyService.registerCompany(req.auth.userId, parsed);
      sendSuccess(res, company, { status: 201 });
    }),

    updateMine: asyncHandler(async (req: Request, res: Response) => {
      if (!req.auth) throw AppError.unauthenticated();
      const parsed = updateCompanySchema.parse(req.body);
      const company = await companyService.updateCompany(req.auth.userId, parsed);
      sendSuccess(res, company);
    }),

    uploadLogo: asyncHandler(async (req: Request, res: Response) => {
      if (!req.auth) throw AppError.unauthenticated();
      if (!req.file) throw AppError.badRequest("No image uploaded");

      const companyId = req.params["companyId"];
      if (!companyId) throw AppError.notFound();

      const isAdmin = req.auth.user.roles.includes("admin");
      const logoUrl = await companyService.uploadCompanyLogo(
        req.auth.userId,
        companyId,
        req.file,
        isAdmin,
      );
      sendSuccess(res, { logoUrl });
    }),

    // Admin endpoints
    listAdmin: asyncHandler(async (req: Request, res: Response) => {
      const { status, q, page, limit } = req.query;
      const result = await companyService.listAdminCompanies({
        status: typeof status === "string" ? status : undefined,
        q: typeof q === "string" ? q : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      sendSuccess(res, result.companies, {
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit) || 1,
          hasNextPage: result.page * result.limit < result.total,
          hasPreviousPage: result.page > 1,
        },
      });
    }),

    review: asyncHandler(async (req: Request, res: Response) => {
      if (!req.auth) throw AppError.unauthenticated();
      const { companyId } = req.params;
      if (!companyId) throw AppError.notFound();

      const parsed = reviewCompanySchema.parse(req.body);
      const company = await companyService.reviewCompany(req.auth.userId, companyId, parsed);
      sendSuccess(res, company);
    }),
  };
}

