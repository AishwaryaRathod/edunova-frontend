import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactSelect from "react-select";

function PeopleDirectory() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
        status: "",
        teams: "",
    });
    const teamsOptions = [
        { value: "UI", label: "UI" },
        { value: "Design", label: "Design" },
        { value: "Product", label: "Product" },
        { value: "Finance", label: "Finance" },
        { value: "Business", label: "Business" },
    ];
    const rolesOptions = [
        { value: "Product Manager", label: "Product Manager" },
        { value: "Frontend Developer", label: "Frontend Developer" },
        { value: "Backend Developer", label: "Backend Developer" },
        { value: "UX Designer", label: "UX Designer" },
        { value: "QA Engineer", label: "QA Engineer" },
    ];
    const [people, setPeople] = useState([]);
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [editingPersonId, setEditingPersonId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    // const [filterType, setFilterType] = useState(null);
    const [showRoles, setShowRoles] = useState(false);
    const [showTeams, setShowTeams] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [expandedPerson, setExpandedPerson] = useState(null);
    const [filterVisible, setFilterVisible] = useState(false);
    // const [selectedTeams, setSelectedTeams] = useState([]);
    const [displayedPeople, setDisplayedPeople] = useState(people);
    const [errors, setErrors] = useState({});

    const handleSelectChange = (selectedOptions) => {
        const teamsString = selectedOptions
            ? selectedOptions.map((option) => option.value).join(", ")
            : "";
        setSelectedTeams(selectedOptions || []);
        setFormData({ ...formData, teams: teamsString });
    };

    const [roleFilter, setroleFilter] = useState('')
    const [teamFilter, setteamFilter] = useState('')
    const [refreshuser, setrefreshuser] = useState(false)

    useEffect(() => {
        const fetchPeople = async () => {
            try {

                let queryString = "";

                if (teamFilter) {
                    queryString += `teams=${teamFilter}`;
                }

                if (roleFilter) {
                    queryString += `${queryString ? '&' : ''}role=${roleFilter}`;
                }

                const url = `https://mongodb-2-mcp4.onrender.com/api/users${queryString ? `?${queryString}` : ""}`;

                const response = await axios.get(url);
                console.log("API Response:", response.data);

                // Reverse the data order
                const reversedData = response.data.reverse();
                setDisplayedPeople(reversedData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchPeople();
    }, [roleFilter, teamFilter]);

    ////////////////////////////// post api////////////////////

    const handleSave = async () => {
        try {
            const dataToSend = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                status: formData.status,
                teams: selectedTeams.map((team) => team.value),
            };
            console.log("Data to send:", dataToSend);

            let response;
            if (editingPersonId) {
                // Update existing person
                console.log("Updating person with ID:", editingPersonId);
                response = await axios.put(
                    `https://mongodb-2-mcp4.onrender.com/api/users/${editingPersonId}`,
                    dataToSend
                );
                console.log("Update response:", response.data);

                // Directly update the displayed list
                setDisplayedPeople((prevPeople) =>
                    prevPeople.map((person) =>
                        person._id === editingPersonId
                            ? { ...person, ...dataToSend }
                            : person
                    )
                );
            } else {
                // Add new person
                response = await axios.post(
                    "https://mongodb-2-mcp4.onrender.com/api/create",
                    dataToSend
                );
                console.log("Create response:", response.data);
                const newPerson = response.data;

                // Prepend the new person to the displayed list
                setDisplayedPeople((prevPeople) => [newPerson, ...prevPeople]);
            }

            // Clear form data and close modal
            setFormData({ name: "", email: "", role: "", status: "", teams: [] });
            setSelectedTeams([]);
            setEditingPersonId(null);
            setIsModalOpen(false);
        } catch (error) {
            console.error(
                "Error saving data:",
                error.response ? error.response.data : error.message
            );
            alert(`Error: ${error.response ? error.response.data.message : error.message}`);
        }
    };

    const handleSubmit = () => {
        if (validateForm()) {
            handleSave();
        }
    };


    //////////////////////   Validation     ////////////////////////
    const validateForm = () => {
        let errors = {};
        if (!formData.name) errors.name = "Name is required";
        if (!formData.email) errors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            errors.email = "Invalid email address";
        if (!formData.role) errors.role = "Role is required";
        if (!formData.status) errors.status = "Status is required";
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };



    //////////////////////// validation end /////////////////////////

    const handleEdit = (person) => {
        setFormData({
            name: person.name,
            email: person.email,
            role: person.role,
            status: person.status,
            teams: person.teams,
        });
        setSelectedTeams(
            person.teams.map((team) => ({ value: team, label: team }))
        );
        console.log(person, "person")
        setEditingPersonId(person._id);
        setIsModalOpen(true);
    };

    ////////////////////////////////////////////////////// delete API /////////////////////////////////

    const [showModal, setShowModal] = useState(false);
    const [selectedPersonId, setSelectedPersonId] = useState(null);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://mongodb-2-mcp4.onrender.com/delete/${id}`);

            // Update the state to remove the deleted person
            setPeople((prevPeople) =>
                prevPeople.filter((person) => person._id !== id)
            );

            setDisplayedPeople((prevDisplayedPeople) =>
                prevDisplayedPeople.filter((person) => person._id !== id)
            );
        } catch (error) {
            console.error("There was an error deleting the person!", error);
        }
    };

    const handleDeleteClick = (id) => {
        setSelectedPersonId(id);
        setShowModal(true);
    };

    const confirmDelete = () => {
        if (selectedPersonId) {
            handleDelete(selectedPersonId);
        }
        setShowModal(false);
    };

    /////////////////////////end///////////////////////////////////

    const handleAddMemberClick = () => {
        setFormData({ name: "", email: "", role: "", status: "", teams: "" });
        setSelectedTeams([]);
        setEditingPersonId(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    // Filter the displayedPeople array based on the searchTerm
    const filteredPeople = displayedPeople.filter(
        (person) =>
            person.name.toLowerCase().includes(searchTerm) ||
            person.role.toLowerCase().includes(searchTerm) ||
            person.email.toLowerCase().includes(searchTerm) ||
            (person.teams && person.teams.toLowerCase().includes(searchTerm))
    );

    const teamColors = [
        { border: "border-purple-600", text: "text-purple-600" },
        { border: "border-green-600", text: "text-green-600" },
        { border: "border-blue-600", text: "text-blue-600" },
        { border: "border-red-600", text: "text-red-600" },
        { border: "border-yellow-600", text: "text-yellow-600" },
        // Add more colors as needed
    ];
    const getColorClass = (index) => {
        const colorIndex = index % teamColors.length;
        return teamColors[colorIndex];
    };

    const handleRowClick = (person) => {
        // Toggle effect: If the same row is clicked, collapse it
        if (expandedPerson && expandedPerson.id === person.id) {
            setExpandedPerson(null);
        } else {
            setExpandedPerson(person);
        }
    };
    const handleClose = () => {
        setExpandedPerson(null); // Reset or clear the expanded person
    };

    //////////////////////////////////.........img function................///////////

    const [imageSrc, setImageSrc] = useState(
        localStorage.getItem("profileImage") ||
        "https://s3-alpha-sig.figma.com/img/27a8/497d/5cb712a39a846f3d49443b8283852dca?Expires=1725235200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=YVH32YiGav9XzRe9cLRrGdFfggovPd30BrcJR9yR5M24HkZRwx0j64SXHwL1jzBODDrq0WnbGYSYxxeKY6T4NX1927CJ31ToZ-evYdVjO7Cac7yUtUCjpkWSwObndWQ664h1768-FOghA1IKQmv4CNZZes7MGRXiJ3hrcZTbSG2IMfg5IjfRAvXJ0UzfQILTgVnKHwS4laVutD1P351Zg4KoaOEAXptF7BaXmZ~mBjK-~QnPRlj1zRhbGmzGug9AuMawT1glF1pAKTOy5po3LapB3tuSi67vdOkzszlMGMmOH0mux1yXfv4Q5KZIHA5Q8PKDZpQhkhB3KsiV9ZvOzw__"
    );

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageSrc(reader.result);
                localStorage.setItem("profileImage", reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChangePhotoClick = () => {
        document.getElementById("fileInput").click();
    };
    const getImageSrc = (personId) => {
        // Fetch the image URL from localStorage
        const imageSrc = localStorage.getItem("profileImage");
        return imageSrc || `https://i.pravatar.cc/40?img=${personId}`;
    };

    ////////////////////////////////////////////////////////////////pagination code ///////////////////////////////////////////////

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Calculate the total number of pages
    const totalPages = Math.ceil(filteredPeople.length / itemsPerPage);

    // Get the current items to display based on the current page
    const currentItems = filteredPeople.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Handle page change
    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    /////////////////////////////..........filter item................... ////////////////////

    const [filteredItems, setFilteredItems] = useState([]);



    useEffect(() => {
        // Only set filteredItems if necessary
        if (JSON.stringify(currentItems) !== JSON.stringify(filteredItems)) {
            setFilteredItems(currentItems);
        }
    }, [currentItems]);

    const handleRoleToggle = () => setShowRoles(!showRoles);
    const handleTeamToggle = () => setShowTeams(!showTeams);

    const handleRoleChange = (role) => {
        setSelectedRoles((prev) => {
            const isSelected = prev.some((r) => r.value === role.value);
            return isSelected
                ? prev.filter((r) => r.value !== role.value)
                : [...prev, role];
        });
        console.log(role, "..... role")
    };
    useEffect(() => {
        console.log(selectedRoles, 'ehgejgdjehf')
    }, [selectedRoles])

    const handleTeamChange = (team) => {
        setSelectedTeams((prev) => {
            const isSelected = prev.some((t) => t.value === team.value);
            return isSelected
                ? prev.filter((t) => t.value !== team.value)
                : [...prev, team];
        });
    };

    const filterItems = () => {
        // let newFilteredItems = currentItems;

        // if (selectedRoles.length > 0) {
        //     newFilteredItems = newFilteredItems.filter((item) =>
        //         selectedRoles.some((role) => item.role === role.value)
        //     );
        // }

        // if (selectedTeams.length > 0) {
        //     newFilteredItems = newFilteredItems.filter((item) =>
        //         selectedTeams.some(
        //             (team) => item.teams && item.teams.split(",").includes(team.value)
        //         )
        //     );
        // }
        // console.log("Filtered Items:", newFilteredItems);

        // setFilteredItems(newFilteredItems);
        const teams = selectedTeams.map((team) => (team.value)).join(', ')
        const roles = selectedRoles.map((role) => (role.value)).join(', ')

        setroleFilter(roles)
        setteamFilter(teams)
        setFilterVisible(!filterVisible);
    };

    const handleFilterClick = () => {
        filterItems();
    };

    const getImageUrl = (userName) => {
        return `https://source.unsplash.com/40x40/?face,${userName}`;
    };

    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">Team Members</h1>
                    <span className="border border-purple-600 text-purple-600 rounded-full px-2 py-1 bg-violet-100 text-sm">
                        100 users
                    </span>
                </div>
                <div className="flex relative">
                    <div className="relative ml-4">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="px-3 py-2 w-80 border border-gray-300 border-b-1 border-b-black rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-600 pr-10"
                        />
                        <i className="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setFilterVisible(!filterVisible)} // Toggle filter section visibility
                            className="ml-2 text-gray-600 hover:text-purple-600"
                        >
                            <i
                                className="fa fa-filter text-2xl p-1 mr-2 text-slate-400"
                                aria-hidden="true"
                            ></i>
                        </button>

                        {/* ////////////////////////////////.................. Filter Section........................///////////////////////////////////////// */}

                        <div
                            id="filterSection"
                            className={`absolute top-full right-0 mt-2 p-4 w-64 border border-gray-300 bg-white shadow-lg z-50 ${filterVisible ? "block" : "hidden"
                                }`}
                        >
                            <div className="border-b border-gray-300 mb-1 flex justify-between items-center">
                                <h5 className="mb-2">Filters</h5>
                                <i
                                    className="fa fa-chevron-up text-slate-500"
                                    aria-hidden="true"
                                ></i>
                            </div>

                            <div
                                className="flex items-center mb-2 justify-between mt-5"
                                onClick={handleRoleToggle}
                            >
                                <label className="flex items-center text-base">
                                    <input
                                        type="checkbox"
                                        id="roles"
                                        className="mr-2"
                                        checked={showRoles}
                                        onChange={handleRoleToggle}
                                    />
                                    Roles
                                </label>
                                <i
                                    className={`fa ${showRoles ? "fa-chevron-up" : "fa-chevron-down"
                                        }`}
                                    aria-hidden="true"
                                ></i>
                            </div>

                            {showRoles && (
                                <div className="mb-2 ml-4">
                                    {rolesOptions.map((option) => (
                                        <div
                                            key={option.value}
                                            className={`flex items-center p-2 cursor-pointer text-sm ${selectedRoles.some(
                                                (role) => role.value === option.value
                                            )
                                                ? "bg-customPurple text-white"
                                                : "bg-white"
                                                }`}
                                            onClick={() => handleRoleChange(option)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedRoles.some(
                                                    (role) => role.value === option.value
                                                )}
                                                onChange={() => handleRoleChange(option)}
                                                className="mr-2"
                                            />
                                            {option.label}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div
                                className="flex items-center justify-between"
                                onClick={handleTeamToggle}
                            >
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="teams"
                                        className="mr-2"
                                        checked={showTeams}
                                        onChange={handleTeamToggle}
                                    />
                                    Teams
                                </label>
                                <i
                                    className={`fa ${showTeams ? "fa-chevron-up" : "fa-chevron-down"
                                        }`}
                                    aria-hidden="true"
                                ></i>
                            </div>

                            {showTeams && (
                                <div className="mb-2 ml-4">
                                    {teamsOptions.map((option) => (
                                        <div
                                            key={option.value}
                                            className={`flex items-center p-2 cursor-pointer text-sm ${selectedTeams.some(
                                                (team) => team.value === option.value
                                            )
                                                ? "bg-customPurple text-white"
                                                : "bg-white"
                                                }`}
                                            onClick={() => handleTeamChange(option)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedTeams.some(
                                                    (team) => team.value === option.value
                                                )}
                                                onChange={() => handleTeamChange(option)}
                                                className="mr-2"
                                            />
                                            {option.label}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                className={`w-full p-1 mt-3 rounded ${selectedRoles.length > 0 || selectedTeams.length > 0
                                    ? "bg-customPurple text-white"
                                    : "bg-gray-300 text-gray-600"
                                    }`}
                                onClick={handleFilterClick}
                            >
                                Select
                            </button>
                        </div>

                        {/* //////////////////////////////...................filter end.................................////////////////////// */}

                    </div>

                    <button
                        onClick={handleAddMemberClick}
                        className="text-white bg-purple-600 px-3 py-1 rounded-lg flex items-center ml-2"
                    >
                        <i className="fas fa-plus mr-2"></i> Add Member
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex flex-col md:flex-row">
                {/* Table Container */}
                <div
                    className={`flex-1 ${expandedPerson ? "w-1/6" : "w-full"
                        } transition-all duration-300`}
                >
                    <table
                        className={`min-w-full bg-white border rounded-lg ${expandedPerson ? "w-full" : "w-full"
                            }`}
                    >
                        <thead>
                            <tr>
                                <td className="py-3 px-4 text-left text-sm w-72">
                                    Name{" "}
                                    <i className="fa fa-arrow-down ml-14" aria-hidden="true"></i>
                                </td>
                                <td className="py-3 px-4 text-left text-sm w-28">
                                    Status{" "}
                                    <i className="fa fa-arrow-down ml-2" aria-hidden="true"></i>
                                </td>
                                {expandedPerson === null && (
                                    <>
                                        <td className="py-3 px-4 text-left text-sm">
                                            Role{" "}
                                            <i
                                                className="fa fa-question-circle ml-1 text-slate-400"
                                                aria-hidden="true"
                                            ></i>
                                        </td>
                                        <td className="py-3 px-4 text-left text-sm">
                                            Email Address
                                        </td>
                                        <td className="py-3 px-4 text-left text-sm w-72">Teams</td>
                                        <td className="py-3 px-4 text-left text-sm">Actions</td>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {console.log("Rendering filtered items:", filteredItems)}
                            {filteredItems.length > 0 ? (
                                filteredItems.map((person, index) => (
                                    <tr
                                        key={person.id}
                                        className={`border-t cursor-pointer ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                            }`}
                                        onClick={() => handleRowClick(person)}
                                    >
                                        <td className="py-3 px-4 flex items-center text-sm">
                                            <img
                                                src={`https://i.pravatar.cc/40?img=${person.name}`}
                                                alt={person.name}
                                                className="w-10 h-10 rounded-full mr-3"
                                            />
                                            <div>
                                                {person.name}
                                                <br />
                                                <span>@username</span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-sm">
                                            <div className="border border-solid rounded-lg shadow-md ml-2 p-1 w-20 text-xs text-center">
                                                <span className="inline-block w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                                                {person.status}
                                            </div>
                                        </td>
                                        {expandedPerson === null && (
                                            <>
                                                <td className="py-3 px-4 text-sm w-48">{person.role}</td>
                                                <td className="py-3 px-4 text-sm">{person.email}</td>
                                                <td className="py-3 px-4 w-56">
                                                    <div className="flex flex-wrap gap-2">
                                                        {person?.teams &&
                                                            person?.teams?.map((team, index) => {
                                                                const { border, text } = getColorClass(index);
                                                                return (
                                                                    <div
                                                                        key={team.trim()}
                                                                        className={`border ${border} rounded-full px-1 text-xs py-1 ${text}`}
                                                                    >
                                                                        {team.trim()}
                                                                    </div>
                                                                );
                                                            })}
                                                        <span className="text-xs border rounded-full h-6 w-9 text-center p-1 shadow">
                                                            +4
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 flex justify-center gap-3 text-sm relative bottom-3">
                                                    <button
                                                        className="text-gray-500 hover:text-red-600 text-lg"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(person._id);
                                                        }}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                    <button
                                                        className="text-gray-500 hover:text-blue-600 ml-3 text-lg"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(person);
                                                        }}
                                                    >
                                                        <i className="fa fa-pencil" aria-hidden="true"></i>
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-3 text-center">
                                        No items found
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>

                    {/* ////////..........................pagination content.........................///////////// */}

                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="py-2 px-4 bg-gray-200 rounded-lg disabled:opacity-50"
                        >
                            <i className="fa fa-arrow-left mr-2" aria-hidden="true"></i>
                            Previous
                        </button>

                        <div className="flex gap-2">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`py-2 px-4 rounded-lg ${currentPage === index + 1
                                        ? "bg-slate-200 border border-customPurple "
                                        : "bg-gray-100"
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="py-2 px-4 bg-gray-200 rounded-lg disabled:opacity-50"
                        >
                            Next <i className="fa fa-arrow-right ml-2" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>

                {/* /////////////////////////////////////////////////////modal////////////////////////////////////// */}

                {/*................................. Expanded Section..................................... */}


                {expandedPerson && (
                    <div className="flex-1 w-[60%] md:w-5/6 ml-4 p-3 rounded-lg shadow-lg transition-all duration-300">
                        <div className="flex bg-custom-blue p-4 mb-4 relative color">
                            <button
                                className="absolute top-2 right-2 text-white hover:text-gray-300 text-lg"
                                onClick={handleClose}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                            <img
                                src={`https://i.pravatar.cc/100?img=${expandedPerson.name}`} // Smaller image size
                                alt={expandedPerson.name}
                                className=" w-28 h-28 rounded-full mr-4 relative bottom-2"
                            />
                            <div className="text-white">
                                <p className="text-xl font-bold mb-2">{expandedPerson.name}</p>
                                <div className="flex">
                                    <div className="pr-2 nameSection">
                                        <p className="text-sm mb-2">@{expandedPerson.name}</p>
                                        <p className="relative bottom-1">User ID</p>
                                    </div>
                                    <div className="pl-2">
                                        <p className="text-sm mb-2">{expandedPerson.role}</p>
                                        <p className="relative bottom-1">Role</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <table className="w-full border-collapse p-2 table">
                            <thead className="bg-blue-50">
                                <tr>
                                    <th className="text-md text-left px-4 py-3 font-semibold mb-2 col-span-2 w-52 text-slate-700">
                                        Personal Information
                                    </th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-300">
                                    <td className="px-4 py-2">Date Of Birth</td>
                                    <td className="px-4 py-2 text-slate-500">15-08-2000</td>
                                </tr>
                                <tr className="border-b border-gray-300">
                                    <td className="px-4 py-2">Nationality</td>
                                    <td className="px-4 py-2 text-slate-500">Indian</td>
                                </tr>
                                <tr className="border-b border-gray-300">
                                    <td className="px-4 py-2">Contact:</td>
                                    <td className="px-4 py-2 text-slate-500">123456789</td>
                                </tr>
                                <tr className="border-b border-gray-300">
                                    <td className="px-4 py-2">Email:</td>
                                    <td className="px-4 py-2 text-slate-500">
                                        {expandedPerson.email}
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-300">
                                    <td className="px-4 py-2">Company Email:</td>
                                    <td className="px-4 py-2 text-slate-500">
                                        {expandedPerson.email || "N/A"}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div>
                            <h1 className="bg-blue-50 p-2 font-semibold text-slate-600">
                                Research & Publication
                            </h1>
                            <p className=" text-sm p-2 font-semibold">
                                AI and User Experience : The Future of Design
                            </p>
                            <p className=" text-xs p-2">
                                Published in the Journal of Modern Design • 2022
                            </p>
                            <p className=" text-xs pl-2  w-[500px]">
                                Al, loT based real time condition monitoring of Electrical
                                Machines using Python language Abstract: Maintaining induction
                                motors in good working order before they fail benefits small{" "}
                                <span className=" text-orange-500"> See More...</span>{" "}
                            </p>
                            <p className=" text-base font-bold text-orange-500 p-2">
                                <i class="fa fa-long-arrow-right" aria-hidden="true"></i> SEE
                                PUBLICATION
                            </p>
                        </div>
                    </div>
                )}
            </div>



            {/*  ................................................ Delete Custom Modal ................................. */}


            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-1/3">
                        <h2 className="text-xl font-bold mb-4">Delete Member Details</h2>
                        <p>
                            Are you sure you want to delete this Member details? This action
                            cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end">
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/*..............................................User information Modal......................................................... */}


            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
                        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                        <div className="text-center mb-4">
                            <img
                                src={imageSrc}
                                alt="Profile"
                                className="w-28 h-28 rounded-full mx-auto mb-2 bg-slate-200"
                            />
                            <div className="flex justify-center gap-4">
                                <button
                                    className="text-slate-800 font-bold w-48 bg-slate-100 hover:text-blue-800 border border-gray-300 h-9"
                                    onClick={handleChangePhotoClick}
                                >
                                    <i className="fa fa-undo mr-2 text-lg" aria-hidden="true"></i>
                                    CHANGE PHOTO
                                </button>
                                <button className="text-slate-800 font-bold w-48 bg-slate-100 hover:text-red-800 border border-gray-300 h-9">
                                    <i className="fa-solid fa-trash-can mr-2 text-lg"></i>
                                    DELETE PHOTO
                                </button>
                            </div>
                            <input
                                type="file"
                                id="fileInput"
                                style={{ display: "none" }}
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 ml-2">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-s font-bold text-gray-700 mb-1 "
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="px-4 py-2 w-80  h-12  border border-gray-300 border-b-1 border-b-black rounded-sm  focus:outline-none focus:ring-2 focus:ring-purple-600"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-s font-bold text-gray-700 mb-1"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="px-4 py-2  border border-gray-300 border-b-1 border-b-black rounded-sm  w-80 h-12  focus:outline-none focus:ring-2 focus:ring-purple-600"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 ml-2">
                            <div>
                                <label
                                    htmlFor="role"
                                    className="block text-s font-bold text-gray-700 mb-1"
                                >
                                    Role
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="px-4 py-2  border border-gray-300 border-b-1 border-b-black rounded-sm  h-12 focus:outline-none focus:ring-2 focus:ring-purple-600 w-80"
                                >
                                    <option value="">Select Role</option>
                                    <option value="Product Manager">Product Manager</option>
                                    <option value="Frontend Developer">Frontend Developer</option>
                                    <option value="Backend Developer">Backend Developer</option>
                                    <option value="UX Designer">UX Designer</option>
                                    <option value="QA Engineer">QA Engineer</option>
                                </select>
                                {errors.role && (
                                    <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="status"
                                    className="block text-s font-bold text-gray-700 mb-1"
                                >
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="px-4 py-2  border border-gray-300 border-b-1 border-b-black rounded-sm  h-12  focus:outline-none focus:ring-2 focus:ring-purple-600 w-80"
                                >
                                    <option value="">Select Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                                {errors.status && (
                                    <p className="text-red-500 text-xs mt-1">{errors.status}</p>
                                )}
                            </div>
                        </div>

                        <div className="mb-4 ml-2">
                            <label
                                htmlFor="teams"
                                className="block text-s font-bold text-gray-700 mb-1"
                            >
                                Teams
                            </label>
                            <ReactSelect
                                options={teamsOptions}
                                isMulti
                                value={selectedTeams}
                                onChange={handleSelectChange}
                                placeholder="Select Teams"
                                className=" focus:ring-2 focus:ring-purple-600 w-[680px]  border border-gray-300 border-b-1 border-b-black rounded-sm "
                                styles={{
                                    control: (provided) => ({
                                        ...provided,
                                        minHeight: "0.75rem", // Decreased height
                                    }),
                                    valueContainer: (provided) => ({
                                        ...provided,
                                        padding: "0.25rem 0.5rem", // Adjust padding for better fit
                                    }),
                                }}
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 border "
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PeopleDirectory;
