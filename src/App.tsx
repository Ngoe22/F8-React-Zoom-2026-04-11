import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "./App.css";

// 1. Định nghĩa các khuôn mẫu dữ liệu (Interfaces)
interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    phone: string;
    // Cho phép gọi thuộc tính động theo dạng key như user['name']
    [key: string]: string | number;
}

interface TableHeadItem {
    hText: string;
    value: string;
    className: string;
    action?: boolean; // Dấu ? nghĩa là thuộc tính này có thể có hoặc không
}

// 2. Gắn type cho mảng cấu hình bảng
const tableHeadInfo: TableHeadItem[] = [
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
    // 3. Khai báo type rõ ràng cho các state
    const [users, setUsers] = useState<User[] | null>(null);
    const [editUser, setEditUser] = useState<User | false>(false);
    const [addUser, setAddUser] = useState<boolean>(false);

    useEffect(() => {
        // Gắn type <User[]> để báo cho axios biết dữ liệu trả về là 1 mảng các User
        axios
            .get<User[]>(`https://jsonplaceholder.typicode.com/users`)
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

                                    return (
                                        <td key={column.value}>
                                            <Tag
                                                onClick={() => callbackFunc?.()}
                                                className={column.className}
                                            >
                                                {/* Ép kiểu ReactNode để TS không báo lỗi khi render chuỗi/số */}
                                                {text as React.ReactNode}
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
                        if (users) {
                            setUsers(
                                editById(users, editUser.id, newU as User),
                            );
                        }
                        toast.success(`Edited`);
                        setEditUser(false);
                    }}
                    onclickFalse={() => setEditUser(false)}
                />
            ) : null}

            {addUser ? (
                <Modal
                    onclickTrue={(newU) => {
                        // Kiểm tra an toàn xem các trường có bị trống hay không
                        const requiredFields = [
                            "name",
                            "username",
                            "email",
                            "phone",
                        ];
                        if (
                            !requiredFields.every(
                                (field) => field in newU && newU[field],
                            )
                        ) {
                            return toast.error(`Complete the fields`);
                        }

                        newU.id = Math.floor(Math.random() * 100000);

                        if (users) {
                            setUsers([...users, newU as User]);
                        } else {
                            setUsers([newU as User]);
                        }
                        toast.success(`Added`);
                        setAddUser(false);
                    }}
                    onclickFalse={() => setAddUser(false)}
                />
            ) : null}

            <ToastContainer />
        </>
    );
}

export default App;

// --- FUNCTIONS --- //

// 4. Định nghĩa type cho Props của Component Modal
interface ModalProps {
    currentU?: Partial<User>; // Partial giúp TS hiểu object này có thể thiếu vài thuộc tính của User
    onclickTrue?: (newU: Partial<User>) => void;
    onclickFalse?: () => void;
    textTrue?: string;
    textFalse?: string;
    textHeading?: string;
}

function Modal({
    currentU = {},
    onclickTrue = () => {},
    onclickFalse = () => {},
    textTrue = "Save",
    textFalse = "Cancel",
    textHeading = "User information",
}: ModalProps) {
    const newU: Partial<User> = { ...currentU };

    return (
        <div className="modalWrapper">
            <div className="modal">
                <h2 className="modalHeader">{textHeading}</h2>

                {/* Thêm onSubmit preventDefault để tránh lỗi tự động reload trang khi ở trong thẻ form */}
                <form
                    className="modalBody"
                    onSubmit={(e) => e.preventDefault()}
                >
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
                                        defaultValue={
                                            currentU[i.value as keyof User] ??
                                            ""
                                        }
                                    />
                                </div>
                            ),
                        )}
                </form>

                <footer className="modalFooter">
                    {/* Nên có type="button" cho các button trong form để nó không trigger submit */}
                    <button
                        type="button"
                        onClick={() => onclickFalse()}
                        className="modalBtn cmBtn false"
                    >
                        {textFalse}
                    </button>
                    <button
                        type="button"
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

// 5. Khai báo rõ ràng tham số đầu vào và đầu ra của helper functions
function deleteById(array: User[], id: number): User[] {
    return array.filter((item) => item.id !== id);
}

function editById(array: User[], id: number, newItem: User): User[] {
    return array.map((item) => (item.id !== id ? item : newItem));
}

// // F8-React-Zoom-2026-04-11 | code gốc bên dưới  , trên là bản đã được AI biên dịch qua TS không đổi logic

// import { useState, useEffect } from "react";
// import { ToastContainer, toast } from "react-toastify";
// import axios from "axios";
// import "./App.css";

// const tableHeadInfo = [
//     { hText: `ID`, value: `id`, className: `id` },
//     { hText: `Name`, value: `name`, className: `` },
//     { hText: `User Name`, value: `username`, className: `` },
//     { hText: `Email`, value: `email`, className: `` },
//     { hText: `Phone`, value: `phone`, className: `` },
//     {
//         hText: ``,
//         value: `edit`,
//         className: `actionBtn cmBtn edit`,
//         action: true,
//     },
//     {
//         hText: ``,
//         value: `delete`,
//         className: `actionBtn cmBtn delete`,
//         action: true,
//     },
// ];

// function App() {
//     const [users, setUsers] = useState(null);
//     const [editUser, setEditUser] = useState(false);
//     const [addUser, setAddUser] = useState(false);

//     useEffect(() => {
//         axios({
//             method: `get`,
//             url: `https://jsonplaceholder.typicode.com/users`,
//         })
//             .then((res) => setUsers(res.data))
//             .catch(() => toast.error(`Failed`));
//     }, []);

//     const board = !users ? (
//         <div> Loading... </div>
//     ) : (
//         <div className="tableWrapper">
//             <table className="table">
//                 <thead className="tableHead">
//                     <tr>
//                         {tableHeadInfo.map((column) => {
//                             return <th key={column.value}>{column.hText}</th>;
//                         })}
//                     </tr>
//                 </thead>
//                 <tbody className="tableBody">
//                     {users.map((user) => {
//                         return (
//                             <tr key={user.id}>
//                                 {tableHeadInfo.map((column) => {
//                                     const isAction = column.action;

//                                     const Tag = isAction ? "button" : "span";
//                                     const text = isAction
//                                         ? column.value
//                                         : user[column.value];

//                                     const callbackFunc = (() => {
//                                         switch (column.value) {
//                                             case "edit":
//                                                 return () => setEditUser(user);
//                                             case "delete":
//                                                 return () => {
//                                                     toast.success(`Deleted`);
//                                                     setUsers(
//                                                         deleteById(
//                                                             users,
//                                                             user.id,
//                                                         ),
//                                                     );
//                                                 };

//                                             default:
//                                                 return undefined;
//                                         }
//                                     })();

//                                     //
//                                     return (
//                                         <td key={column.value}>
//                                             <Tag
//                                                 onClick={() => callbackFunc?.()}
//                                                 className={column.className}
//                                             >
//                                                 {text}
//                                             </Tag>
//                                         </td>
//                                     );
//                                 })}
//                             </tr>
//                         );
//                     })}
//                 </tbody>
//             </table>
//             <div onClick={() => setAddUser(true)} className="tableAdd">
//                 Add User
//             </div>
//         </div>
//     );

//     return (
//         <>
//             {board}

//             {editUser ? (
//                 <Modal
//                     currentU={editUser}
//                     onclickTrue={(newU) => {
//                         setUsers(editById(users, editUser.id, newU));
//                         toast.success(`Edited`);
//                         setEditUser(false);
//                     }}
//                     onclickFalse={() => setEditUser(false)}
//                 ></Modal>
//             ) : null}

//             {addUser ? (
//                 <Modal
//                     onclickTrue={(newU) => {
//                         if (
//                             !["name", "username", `email`, `phone`].every(
//                                 (field) => field in newU,
//                             )
//                         )
//                             return toast.error(` Complete the filed `);
//                         newU.id = Math.floor(Math.random() * 100000);
//                         users.push(newU);
//                         setUsers([...users]);
//                         toast.success(`Added`);
//                         setAddUser(false);
//                     }}
//                     onclickFalse={() => setAddUser(false)}
//                 ></Modal>
//             ) : null}

//             <ToastContainer />
//         </>
//     );
// }

// export default App;

// // functions

// function Modal({
//     currentU = {},
//     onclickTrue = () => {},
//     onclickFalse = () => {},
//     textTrue = "Save",
//     textFalse = "Cancel",
//     textHeading = "User information",
// }) {
//     const newU = { ...currentU };

//     return (
//         <div className="modalWrapper">
//             <div className="modal">
//                 <h2 className="modalHeader">{textHeading}</h2>

//                 <form className="modalBody">
//                     {tableHeadInfo
//                         .filter((i) => !i.action)
//                         .map((i) =>
//                             i.value === `id` ? null : (
//                                 <div className="modalInputBlock" key={i.value}>
//                                     <label className="modalInputLabel">
//                                         {i.hText}
//                                     </label>
//                                     <input
//                                         onChange={(e) => {
//                                             newU[i.value] = e.target.value;
//                                         }}
//                                         className="modalInput"
//                                         type="text"
//                                         defaultValue={currentU[i.value] ?? null}
//                                     />
//                                 </div>
//                             ),
//                         )}
//                 </form>

//                 <footer className="modalFooter">
//                     <button
//                         onClick={() => onclickFalse()}
//                         className="modalBtn cmBtn false"
//                     >
//                         {textFalse}
//                     </button>
//                     <button
//                         onClick={() => onclickTrue(newU)}
//                         className="modalBtn cmBtn true"
//                     >
//                         {textTrue}
//                     </button>
//                 </footer>
//             </div>
//         </div>
//     );
// }

// function deleteById(array, id) {
//     return array.filter((item) => item.id !== id);
// }

// function editById(array, id, newItem) {
//     return array.map((item) => (item.id !== id ? item : newItem));
// }
