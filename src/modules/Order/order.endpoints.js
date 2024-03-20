import { systemRoles } from "../../utils/system-roles.js";



export const endpointsRoles  = {
    CANCEL_ORDER:[systemRoles.ADMIN , systemRoles.USER],
    PLACE_ORDER: [systemRoles.USER],
    DELIVER_ORDER: [systemRoles.DELIVERY_PERSON]
}