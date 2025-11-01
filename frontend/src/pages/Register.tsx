import React from "react";
import RegisterImage from "../assets/RegisterImage.svg";
import Facebook from "../assets/Facebook.svg";
import Google from "../assets/Google.svg";
import Apple from "../assets/Apple.svg";

const Register: React.FC = () => {
    return(
        <div className="flex min-h-screen w-full">
            {/**left section of the page */}
            <div className="w-1/3 flex items-center justify-center">
                <img src={RegisterImage} alt="Register Image" className="max-w-full h-auto object-contain"/>
            </div>
            {/**Right section of the card */}
            <div className="w-2/3 flex flex-col items-center">
                <h1 className="text-3xl font-bold text-center text-amber-600 p-5 px-5 mt-5">
                    Welcome to Colombo International Book Fair
                </h1>
                <p className="text-sm text-gray-300 mb-2">
                    Lets get you set up so you can access your personal account.
                </p>
                <h2 className="text-2xl font-bold text-amber-500 mb-6">
                    Sign Up your Account
                </h2>

                <form className="w-full p-8">
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        className="p-3 rounded bg-amber-200 text-gray-900 placeholder-gray-700 focus:outline-none"
                        />
                        <input
                        type="text"
                        name="lasrName"
                        placeholder="Last Name"
                        className="p-3 rounded bg-amber-200 text-gray-900 placeholder-gray-700 focus:outline-none"
                        />                    
                    </div>
                    <div className="grid grid-cols-2 gap-8 mb-8">
                    <input
                        type="text"
                        name="email"
                        placeholder="Email"
                        className="p-3 rounded bg-amber-200 text-gray-900 placeholder-gray-700 focus:outline-none"
                        />
                        <input
                        type="tel"
                        name="phoneNumber"
                        placeholder="Phone Number"
                        className="p-3 rounded bg-amber-200 text-gray-900 placeholder-gray-700 focus:outline-none"
                        />
                        
                    </div>
                   
                    <input
                        type="text"
                        name="password"
                        placeholder="Password"
                        className="w-full p-3 rounded bg-amber-200 text-gray-900 placeholder-gray-700 focus:outline-none mb-8"
                        />
                        <input
                        type="text"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        className="w-full p-3 rounded bg-amber-200 text-gray-900 placeholder-gray-700 focus:outline-none mb-8"
                        />
                        <label className="flex text-sm space-x-2 text-gray-300">
                            <input
                            type="checkbox"
                            name="agree"/>
                            <span>I agree to all the Terms and Privacy Policies</span>
                        </label>
                        <button
                        type="submit"
                        className="w-full bg-yellow-600 hover:bg-yellow-700 rounded-xl mt-4 p-3">
                            Create Account
                        </button>
                        <div className="text-center mt-5 text-gray-300">
                            <p>Already have an Account?{' '}
                            <a href="" className="text-amber-300 hover:underline">
                                Login
                            </a>
                            </p>
                            <p className="mt-3 text-gray-400">
                                Or Sign Up With
                            </p>
                            <div className="flex justify-center gap-6 mt-4 items-center">
                                <button className="bg-amber-100 p-6 rounded-lg cursor-pointer w-lg flex justify-center items-center">
                                <img src={Facebook} alt="Facebook Image" className="max-w-full h-auto object-contain items-center justify-center"/>
                                </button>
                                <button className="bg-amber-100 p-6 rounded-lg cursor-pointer w-lg flex justify-center items-center">
                                <img src={Google} alt="Google Image" className="max-w-full h-auto object-contain items-center"/>
                                </button>
                                <button className="bg-amber-100 p-6 rounded-lg cursor-pointer w-lg flex justify-center items-center">
                                <img src={Apple} alt="Apple Image" className="max-w-full h-auto object-contain items-center"/>
                                </button>
                            </div>
                        </div>
                </form>
            </div>
        </div>
    );
};

export default Register;