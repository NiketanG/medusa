export const ContainerRegistrationKeys = {
  PG_CONNECTION: "__pg_connection__",
  MANAGER: "manager",
  CONFIG_MODULE: "configModule",
  LOGGER: "logger",
  REMOTE_QUERY: "remoteQuery",
  QUERY: "query",
  /**
   * @deprecated use {@link ContainerRegistrationKeys.LINK} instead.
   */
  REMOTE_LINK: "remoteLink",
  /**
   * @version 2.2.0
   */
  LINK: "link",
  FEATURE_FLAG_ROUTER: "featureFlagRouter",
} as const
