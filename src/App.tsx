// F8-React-Zoom-2026-04-11

import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "./App.css";

const tableHeadInfo = [
    { hText: `ID`, value: `id`, className: `id` },
    { hText: `Name`, value: `name`, className: `` },
    { hText: `User Name`, value: `username`, className: `` },
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

function App() {
    const [users, setUsers] = useState(null);
    const [editUser, setEditUser] = useState(false);
    const [addUser, setAddUser] = useState(false);

    useEffect(() => {
        axios({
            method: `get`,
            url: `https://jsonplaceholder.typicode.com/users`,
        })
            .then((res) => setUsers(res.data))
            .catch(() => toast.error(`Failed`));
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
                                                return () => {
                                                    toast.success(`Deleted`);
                                                    setUsers(
                                                        deleteById(
                                                            users,
                                                            user.id,
                                                        ),
                                                    );
                                                };

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
                    onclickTrue={(newU) => {
                        setUsers(editById(users, editUser.id, newU));
                        toast.success(`Edited`);
                        setEditUser(false);
                    }}
                    onclickFalse={() => setEditUser(false)}
                ></Modal>
            ) : null}

            {addUser ? (
                <Modal
                    onclickTrue={(newU) => {
                        if (
                            !["name", "username", `email`, `phone`].every(
                                (field) => field in newU,
                            )
                        )
                            return toast.error(` Complete the filed `);
                        newU.id = Math.floor(Math.random() * 100000);
                        users.push(newU);
                        setUsers([...users]);
                        toast.success(`Added`);
                        setAddUser(false);
                    }}
                    onclickFalse={() => setAddUser(false)}
                ></Modal>
            ) : null}

            <ToastContainer />
        </>
    );
}

export default App;

// functions

function Modal({
    currentU = {},
    onclickTrue = () => {},
    onclickFalse = () => {},
    textTrue = "Save",
    textFalse = "Cancel",
    textHeading = "User information",
}) {
    const newU = { ...currentU };

    return (
        <div className="modalWrapper">
            <div className="modal">
                <h2 className="modalHeader">{textHeading}</h2>

                <form className="modalBody">
                    {tableHeadInfo
                        .filter((i) => !i.action)
                        .map((i) =>
                            i.value === `id` ? null : (
                                <div className="modalInputBlock" key={i.value}>
                                    <label className="modalInputLabel">
                                        {i.hText}
                                    </label>
                                    <input
                                        onChange={(e) => {
                                            newU[i.value] = e.target.value;
                                        }}
                                        className="modalInput"
                                        type="text"
                                        defaultValue={currentU[i.value] ?? null}
                                    />
                                </div>
                            ),
                        )}
                </form>

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

function deleteById(array, id) {
    return array.filter((item) => item.id !== id);
}

function editById(array, id, newItem) {
    return array.map((item) => (item.id !== id ? item : newItem));
}
