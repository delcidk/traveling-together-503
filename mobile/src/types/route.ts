import { Route } from "@shared/types";

export type RouteCategory = "playa" | "internacional" | "aeropuerto" | "ciudad" | "escenico";

export type ApiRoute = Omit<Route, "createdAt" | "updatedAt"> & {
  createdAt?: string | Date;
  updatedAt?: string | Date;
  categoria?: RouteCategory;
};
