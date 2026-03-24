import React from "react";

export interface AddUserProps extends React.SVGProps<SVGSVGElement> {}

export const AddUser: React.FC<AddUserProps> = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>Add User</title>
      <circle cx="24" cy="12" r="8" fill="currentColor" />
      <path d="M42 44c0-9.941-8.059-18-18-18S6 34.059 6 44" />
      <path d="M19 39h10" />
      <path d="M24 34v10" />
    </svg>
  );
};

export default AddUser;