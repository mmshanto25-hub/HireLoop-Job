import type {
  ProfileResponse,
  SeekerProfileData,
  RecruiterProfileData,
  UpdateSeekerProfileInput,
  UpdateRecruiterProfileInput,
  UserRole,
} from "@hireloop/shared";
import {
  UserModel,
  SeekerProfileModel,
  RecruiterProfileModel,
  calculateSeekerCompleteness,
} from "../models/index.js";
import { AppError } from "../utils/AppError.js";
import {
  storePublicImage,
  storePrivateResume,
  getPrivateResumeStream,
  deletePrivateResume,
} from "./storage.service.js";

export async function getProfile(userId: string, roles: UserRole[]): Promise<ProfileResponse> {
  const user = await UserModel.findById(userId);
  if (!user) throw AppError.unauthenticated();

  let seekerData: SeekerProfileData | null = null;
  let recruiterData: RecruiterProfileData | null = null;

  if (roles.includes("seeker")) {
    let seeker = await SeekerProfileModel.findOne({ userId });
    if (!seeker) {
      // Lazy init seeker profile
      const completeness = calculateSeekerCompleteness({}, Boolean(user.avatarUrl));
      seeker = await SeekerProfileModel.create({
        userId,
        profileCompleteness: completeness,
      });
    }
    seekerData = {
      userId: String(seeker.userId),
      headline: seeker.headline ?? null,
      bio: seeker.bio ?? null,
      skills: seeker.skills ?? [],
      location: seeker.location ?? null,
      phone: seeker.phone ?? null,
      socialLinks: {
        linkedin: seeker.socialLinks?.linkedin ?? null,
        github: seeker.socialLinks?.github ?? null,
        portfolio: seeker.socialLinks?.portfolio ?? null,
      },
      resumeObjectKey: seeker.resumeObjectKey ?? null,
      resumeFileName: seeker.resumeFileName ?? null,
      profileCompleteness: seeker.profileCompleteness ?? 0,
      emailPreferences: {
        applicationUpdates: seeker.emailPreferences?.applicationUpdates ?? true,
        jobAlerts: seeker.emailPreferences?.jobAlerts ?? true,
        marketing: seeker.emailPreferences?.marketing ?? false,
      },
      jobAlertPreferences: {
        categories: seeker.jobAlertPreferences?.categories ?? [],
        jobTypes: seeker.jobAlertPreferences?.jobTypes ?? [],
        locations: seeker.jobAlertPreferences?.locations ?? [],
        remote: seeker.jobAlertPreferences?.remote ?? false,
      },
      createdAt: seeker.createdAt.toISOString(),
      updatedAt: seeker.updatedAt.toISOString(),
    };
  }

  if (roles.includes("recruiter")) {
    let recruiter = await RecruiterProfileModel.findOne({ userId });
    if (!recruiter) {
      recruiter = await RecruiterProfileModel.create({ userId });
    }
    recruiterData = {
      userId: String(recruiter.userId),
      jobTitle: recruiter.jobTitle ?? null,
      phone: recruiter.phone ?? null,
      socialLinks: {
        linkedin: recruiter.socialLinks?.linkedin ?? null,
        twitter: recruiter.socialLinks?.twitter ?? null,
      },
      notificationPreferences: {
        newApplications: recruiter.notificationPreferences?.newApplications ?? true,
        applicationUpdates: recruiter.notificationPreferences?.applicationUpdates ?? true,
        marketing: recruiter.notificationPreferences?.marketing ?? false,
      },
      createdAt: recruiter.createdAt.toISOString(),
      updatedAt: recruiter.updatedAt.toISOString(),
    };
  }

  return {
    fullName: user.fullName,
    email: user.email,
    avatarUrl: user.avatarUrl ?? null,
    seekerProfile: seekerData,
    recruiterProfile: recruiterData,
  };
}

export async function updateSeekerProfile(
  userId: string,
  input: UpdateSeekerProfileInput,
): Promise<SeekerProfileData> {
  const user = await UserModel.findById(userId);
  if (!user) throw AppError.unauthenticated();

  let profile = await SeekerProfileModel.findOne({ userId });
  if (!profile) {
    profile = new SeekerProfileModel({ userId });
  }

  if (input.headline !== undefined) profile.headline = input.headline;
  if (input.bio !== undefined) profile.bio = input.bio;
  if (input.skills !== undefined) profile.skills = input.skills;
  if (input.location !== undefined) profile.location = input.location;
  if (input.phone !== undefined) profile.phone = input.phone;

  if (input.socialLinks) {
    profile.socialLinks = {
      linkedin: input.socialLinks.linkedin ?? profile.socialLinks?.linkedin ?? null,
      github: input.socialLinks.github ?? profile.socialLinks?.github ?? null,
      portfolio: input.socialLinks.portfolio ?? profile.socialLinks?.portfolio ?? null,
    };
  }

  if (input.emailPreferences) {
    profile.emailPreferences = {
      applicationUpdates:
        input.emailPreferences.applicationUpdates ??
        profile.emailPreferences?.applicationUpdates ??
        true,
      jobAlerts:
        input.emailPreferences.jobAlerts ?? profile.emailPreferences?.jobAlerts ?? true,
      marketing:
        input.emailPreferences.marketing ?? profile.emailPreferences?.marketing ?? false,
    };
  }

  if (input.jobAlertPreferences) {
    profile.jobAlertPreferences = {
      categories:
        input.jobAlertPreferences.categories ??
        profile.jobAlertPreferences?.categories ??
        [],
      jobTypes:
        input.jobAlertPreferences.jobTypes ?? profile.jobAlertPreferences?.jobTypes ?? [],
      locations:
        input.jobAlertPreferences.locations ?? profile.jobAlertPreferences?.locations ?? [],
      remote:
        input.jobAlertPreferences.remote ?? profile.jobAlertPreferences?.remote ?? false,
    };
  }

  profile.profileCompleteness = calculateSeekerCompleteness(
    profile.toObject(),
    Boolean(user.avatarUrl),
  );

  await profile.save();

  return {
    userId: String(profile.userId),
    headline: profile.headline ?? null,
    bio: profile.bio ?? null,
    skills: profile.skills ?? [],
    location: profile.location ?? null,
    phone: profile.phone ?? null,
    socialLinks: {
      linkedin: profile.socialLinks?.linkedin ?? null,
      github: profile.socialLinks?.github ?? null,
      portfolio: profile.socialLinks?.portfolio ?? null,
    },
    resumeObjectKey: profile.resumeObjectKey ?? null,
    resumeFileName: profile.resumeFileName ?? null,
    profileCompleteness: profile.profileCompleteness,
    emailPreferences: {
      applicationUpdates: profile.emailPreferences?.applicationUpdates ?? true,
      jobAlerts: profile.emailPreferences?.jobAlerts ?? true,
      marketing: profile.emailPreferences?.marketing ?? false,
    },
    jobAlertPreferences: {
      categories: profile.jobAlertPreferences?.categories ?? [],
      jobTypes: profile.jobAlertPreferences?.jobTypes ?? [],
      locations: profile.jobAlertPreferences?.locations ?? [],
      remote: profile.jobAlertPreferences?.remote ?? false,
    },
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export async function updateRecruiterProfile(
  userId: string,
  input: UpdateRecruiterProfileInput,
): Promise<RecruiterProfileData> {
  let profile = await RecruiterProfileModel.findOne({ userId });
  if (!profile) {
    profile = new RecruiterProfileModel({ userId });
  }

  if (input.jobTitle !== undefined) profile.jobTitle = input.jobTitle;
  if (input.phone !== undefined) profile.phone = input.phone;

  if (input.socialLinks) {
    profile.socialLinks = {
      linkedin: input.socialLinks.linkedin ?? profile.socialLinks?.linkedin ?? null,
      twitter: input.socialLinks.twitter ?? profile.socialLinks?.twitter ?? null,
    };
  }

  if (input.notificationPreferences) {
    profile.notificationPreferences = {
      newApplications:
        input.notificationPreferences.newApplications ??
        profile.notificationPreferences?.newApplications ??
        true,
      applicationUpdates:
        input.notificationPreferences.applicationUpdates ??
        profile.notificationPreferences?.applicationUpdates ??
        true,
      marketing:
        input.notificationPreferences.marketing ??
        profile.notificationPreferences?.marketing ??
        false,
    };
  }

  await profile.save();

  return {
    userId: String(profile.userId),
    jobTitle: profile.jobTitle ?? null,
    phone: profile.phone ?? null,
    socialLinks: {
      linkedin: profile.socialLinks?.linkedin ?? null,
      twitter: profile.socialLinks?.twitter ?? null,
    },
    notificationPreferences: {
      newApplications: profile.notificationPreferences?.newApplications ?? true,
      applicationUpdates: profile.notificationPreferences?.applicationUpdates ?? true,
      marketing: profile.notificationPreferences?.marketing ?? false,
    },
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export async function updateFullName(userId: string, fullName: string): Promise<string> {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { fullName } },
    { new: true },
  );
  if (!user) throw AppError.unauthenticated();
  return user.fullName;
}

export async function updateAvatar(
  userId: string,
  file: Express.Multer.File,
): Promise<string> {
  const stored = await storePublicImage(file.buffer, file.originalname, file.mimetype);
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { avatarUrl: stored.url } },
    { new: true },
  );
  if (!user) throw AppError.unauthenticated();

  // Recalculate seeker completeness if exists
  const seeker = await SeekerProfileModel.findOne({ userId });
  if (seeker) {
    seeker.profileCompleteness = calculateSeekerCompleteness(seeker.toObject(), true);
    await seeker.save();
  }

  return stored.url;
}

export async function uploadResume(
  userId: string,
  file: Express.Multer.File,
): Promise<{ resumeObjectKey: string; resumeFileName: string; profileCompleteness: number }> {
  const stored = await storePrivateResume(file.buffer, file.originalname, file.mimetype);

  let profile = await SeekerProfileModel.findOne({ userId });
  if (!profile) {
    profile = new SeekerProfileModel({ userId });
  }

  // Delete old resume if present
  if (profile.resumeObjectKey) {
    await deletePrivateResume(profile.resumeObjectKey);
  }

  profile.resumeObjectKey = stored.objectKey;
  profile.resumeFileName = file.originalname;

  const user = await UserModel.findById(userId);
  profile.profileCompleteness = calculateSeekerCompleteness(
    profile.toObject(),
    Boolean(user?.avatarUrl),
  );

  await profile.save();

  return {
    resumeObjectKey: stored.objectKey,
    resumeFileName: file.originalname,
    profileCompleteness: profile.profileCompleteness,
  };
}

export async function getResume(
  userId: string,
): Promise<{ buffer: Buffer; fileName: string }> {
  const profile = await SeekerProfileModel.findOne({ userId });
  if (!profile || !profile.resumeObjectKey) {
    throw AppError.notFound("No resume uploaded");
  }
  const buffer = await getPrivateResumeStream(profile.resumeObjectKey);
  return {
    buffer,
    fileName: profile.resumeFileName || "resume.pdf",
  };
}

export async function deleteResume(userId: string): Promise<number> {
  const profile = await SeekerProfileModel.findOne({ userId });
  if (!profile || !profile.resumeObjectKey) return 0;

  await deletePrivateResume(profile.resumeObjectKey);
  profile.resumeObjectKey = null;
  profile.resumeFileName = null;

  const user = await UserModel.findById(userId);
  profile.profileCompleteness = calculateSeekerCompleteness(
    profile.toObject(),
    Boolean(user?.avatarUrl),
  );
  await profile.save();

  return profile.profileCompleteness;
}

