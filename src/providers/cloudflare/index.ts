import type {
  CloudflareGetZoneFromIdResponse,
  CloudflareInstanceOptions,

  CloudflareListZonesProps,
  CloudflareListZonesResponse
} from "./types/CloudflareApi.js";

import got from "got";
import handleError from "./utils/errorHandler.js";
import CloudflareApiZone from "./Zone.js";
export class CloudflareApi {
  private api: typeof got;

  /**
   * Cloudflare API new instance.
   * @param {CloudflareInstanceOptions} options - Options for the Cloudflare API
   */
  constructor (options: CloudflareInstanceOptions) {
    this.api = got.extend({
      prefixUrl: "https://api.cloudflare.com/client/v4/"
    });

    // Authenticate with API Token.
    if (options.token) {
      this.api = this.api.extend({
        headers: {
          "Authorization": `Bearer ${options.token}`
        }
      });
    }
    // Authenticate with authKeys
    else if (options.authEmail && options.authKey) {
      this.api = this.api.extend({
        headers: {
          "X-Auth-Key": options.authKey,
          "X-Auth-Email": options.authEmail
        }
      });
    }
    // If we can't authenticate, send error.
    else {
      throw new Error("[CloudflareApi] {token} or {authEmail, authKey} missing !");
    }
  }

  /**
   * Listing all the user's zones.
   * Adapated from https://api.cloudflare.com/#zone-list-zones.
   */
  public async listZones ({
    name,
    accountId,
    accountName,
    direction,
    match = "all",
    order,
    status,
    page = 1,
    per_page = 20
  }: CloudflareListZonesProps) {
    if (page < 1) throw Error("Page can't be under 1 as it's the minimum value.");
    if (per_page > 50) throw Error("You can't show more than 50 results per page.");
    if (per_page < 5) throw Error("You can't show less than 5 results per page.");

    try {
      const body = await this.api.get("zones", {
        searchParams: {
          // Check if match ?
          match,

          // Match requirements.
          name,
          "account.id": accountId,
          "account.name": accountName,
          status,

          // How many results per page.
          page,
          per_page,

          // How is returned results.
          direction,
          order
        }
      }).json<CloudflareListZonesResponse>();

      return {
        zones: body.result.map(zone => new CloudflareApiZone(this.api, zone)),
        resultInfo: body.result_info
      };
    }
    catch (error) {
      handleError(error);
      throw error;
    }
  }

  public async getZoneFromId (zoneId: string) {
    try {
      const body = await this.api.get(`zones/${zoneId}`).json<CloudflareGetZoneFromIdResponse>();
      return new CloudflareApiZone(this.api, body.result);
    }
    catch (error) {
      handleError(error);
      throw error;
    }
  }
}