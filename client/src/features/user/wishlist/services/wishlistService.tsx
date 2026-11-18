import { WISHLIST_BASE_ROUTE } from "../../../../constents/routes/apiRoutes";
import api from "../../../../services/api";

//* add to wishlist
export const addToWishlist = async (jobId: string) => {
  return api.post(`/${WISHLIST_BASE_ROUTE}/${jobId}`).then((res) => res.data);
};
//* delete from wishlist
export const removeFromWishlist = async (jobId: string) => {
  return api.delete(`/${WISHLIST_BASE_ROUTE}/${jobId}`).then((res) => res.data);
};
//* get wishlist
export const getWishlist = async () => {
  return api.get(`/${WISHLIST_BASE_ROUTE}`).then((res) => res.data);
};
