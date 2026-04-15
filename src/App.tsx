import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "./App.css";

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;

    [key: string]: string;
}

const tableHeadInfo = [
    { hText: `ID`, value: `id`, className: `id` },
    { hText: `Name`, value: `name`, className: `` },
    { hText: `Email`, value: `email`, className: `` },
    { hText: `Phone`, value: `phone`, className: `` },
    {
        hText: ``,
        value: `edit`,
        className: `actionBtn cmBtn edit`,
        action: true,
    },
    {
        hText: ``,
        value: `delete`,
        className: `actionBtn cmBtn delete`,
        action: true,
    },
];

const dataAPI = `https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com/customers/`;

function App() {
    const [token, setToken] = useState(null);
    const [users, setUsers] = useState<User[] | null>(null);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [addUser, setAddUser] = useState<true | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);

    useEffect(() => {
        (async () => {
            const tokenRespone = await fetch(
                "https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com/auth/signin",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: "sonnv@test.com",
                        password: "12345678",
                    }),
                },
            ).then((res) => res.json());

            const token = tokenRespone.accessToken;
            setToken(token);

            axios(dataAPI, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => setUsers(res.data))
                .catch(() => toast.error(`Failed`));
        })();
    }, []);

    const board = !users ? (
        <div> Loading... </div>
    ) : (
        <div className="tableWrapper">
            <table className="table">
                <thead className="tableHead">
                    <tr>
                        {tableHeadInfo.map((column) => {
                            return <th key={column.value}>{column.hText}</th>;
                        })}
                    </tr>
                </thead>
                <tbody className="tableBody">
                    {users.map((user) => {
                        return (
                            <tr key={user.id}>
                                {tableHeadInfo.map((column) => {
                                    const isAction = column.action;

                                    const Tag = isAction ? "button" : "span";
                                    const text = isAction
                                        ? column.value
                                        : user[column.value];

                                    const callbackFunc = (() => {
                                        switch (column.value) {
                                            case "edit":
                                                return () => setEditUser(user);
                                            case "delete":
                                                return () =>
                                                    setDeleteUser(user);
                                            default:
                                                return undefined;
                                        }
                                    })();

                                    //
                                    return (
                                        <td key={column.value}>
                                            <Tag
                                                onClick={() => callbackFunc?.()}
                                                className={column.className}
                                            >
                                                {text}
                                            </Tag>
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div onClick={() => setAddUser(true)} className="tableAdd">
                Add User
            </div>
        </div>
    );

    return (
        <>
            {board}

            {editUser ? (
                <Modal
                    currentU={editUser}
                    onclickTrue={async (newU) => {
                        try {
                            await editUserAPI(editUser.id, newU, token);
                            setUsers(editById(users, editUser.id, newU));
                            toast.success(`Edited`);
                            setEditUser(false);
                        } catch (er) {
                            toast.error("Edit failed");
                        }
                    }}
                    onclickFalse={() => setEditUser(null)}
                ></Modal>
            ) : null}

            {addUser ? (
                <Modal
                    onclickTrue={async (newU) => {
                        if (!newU) return;
                        if (
                            !["name", `email`, `phone`].every(
                                (field) => field in newU,
                            )
                        ) {
                            toast.error(` Complete the filed `);
                            return;
                        }

                        try {
                            newU.id = String(Math.floor(Math.random() * 1000));
                            await addUserAPI(newU, token);
                            if (users) {
                                users.push(newU);
                                setUsers(users);
                                toast.success("Added");
                            }
                            setAddUser(null);
                        } catch (er) {
                            console.log(er);
                            toast.error("Add failed");
                        }
                    }}
                    onclickFalse={() => setAddUser(null)}
                ></Modal>
            ) : null}

            {deleteUser ? (
                <Modal
                    form={false}
                    textHeading="Sure wanna delete"
                    textTrue="Confirm"
                    onclickTrue={async () => {
                        try {
                            await deleteUserAPI(deleteUser.id, token);
                            setUsers(deleteById(users, deleteUser.id));
                            toast.success(`Deleted`);
                            setDeleteUser(null);
                        } catch (error) {
                            console.log(error);
                            toast.error(`Failed`);
                        }
                    }}
                    onclickFalse={() => setDeleteUser(null)}
                ></Modal>
            ) : null}

            <ToastContainer />
        </>
    );
}

export default App;

// ================================= functions =================================

interface ModalProps {
    form?: boolean;
    currentU?: User | null;
    onclickTrue: (newU: User | null) => void | Promise<void>;
    onclickFalse: () => void;
    textTrue?: string;
    textFalse?: string;
    textHeading?: string;
}

function Modal({
    form = true,
    currentU = null,
    onclickTrue = () => {},
    onclickFalse = () => {},
    textTrue = "Save",
    textFalse = "Cancel",
    textHeading = "User information",
}: ModalProps) {
    const newU = currentU
        ? { ...currentU }
        : {
              id: "",
              name: "",
              email: "",
              phone: "",
              address: "",
          };

    return (
        <div className="modalWrapper">
            <div className="modal">
                <h2 className="modalHeader">{textHeading}</h2>

                {form ? (
                    <form className="modalBody">
                        {tableHeadInfo
                            .filter((i) => !i.action)
                            .map((i) =>
                                i.value === `id` ? null : (
                                    <div
                                        className="modalInputBlock"
                                        key={i.value}
                                    >
                                        <label className="modalInputLabel">
                                            {i.hText}
                                        </label>
                                        <input
                                            onChange={(e) => {
                                                newU[i.value] = e.target.value;
                                            }}
                                            className="modalInput"
                                            type="text"
                                            defaultValue={
                                                currentU
                                                    ? currentU[i.value]
                                                    : ``
                                            }
                                        />
                                    </div>
                                ),
                            )}
                    </form>
                ) : null}

                <footer className="modalFooter">
                    <button
                        onClick={() => onclickFalse()}
                        className="modalBtn cmBtn false"
                    >
                        {textFalse}
                    </button>
                    <button
                        onClick={() => onclickTrue(newU)}
                        className="modalBtn cmBtn true"
                    >
                        {textTrue}
                    </button>
                </footer>
            </div>
        </div>
    );
}

function deleteById(array: User[] | null, id: string) {
    return array ? array.filter((item) => item.id !== id) : null;
}

function editById(array: User[], id: string | number, newItem: User) {
    return array.map((item) => (item.id !== id ? item : newItem));
}

// ================================= API =================================

function editUserAPI(id: string, newItem: User, token: string) {
    axios(`${dataAPI}${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        data: newItem,
    })
        .then((res) => console.log(res.data))
        .catch(() => toast.error(`Failed`));
}

function addUserAPI(newItem: User, token: string | null) {
    axios(`${dataAPI}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        data: newItem,
    })
        .then((res) => console.log(res.data))
        .catch(() => toast.error(`Failed`));
}

function deleteUserAPI(id: string, token: string | null) {
    axios(`${dataAPI}${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then((res) => console.log(res.data))
        .catch(() => toast.error(`Failed`));
}
