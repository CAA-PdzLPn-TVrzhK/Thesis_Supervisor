
import {setRoleIdAsSupervisor} from "./setRoleAsSupervisor.jsx";
import {setRoleIdAsStudent} from "./setRoleIdAsStudent.jsx";

export async function setRole(role) {
    if (role === "student") {
        await setRoleIdAsStudent();
    } else {
        await setRoleIdAsSupervisor();
    }
}