import React, { useState, useEffect, useRef } from "react";
import "./RAMyTeam.css";
import { FaFilter, FaSearch } from "react-icons/fa";
import AdminSidebar from "../AdminSidebar";
import Topbar from "../Topbar";
import { useNavigate } from "react-router-dom";
import group10 from "../../../assets/Group10.png";
import timemgnt from "../../../assets/Timemgnt.png";
import apiClient from "../../../utils/apiClient";
// import "../Approval/RegularizationApproval.css";

export default function RegularizationApprovalMyTeam() {
	const [data, setData] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("All");
	const [attendanceType, setAttendanceType] = useState("All");
	const [sortOrder, setSortOrder] = useState("Newest");
	const [showFilter, setShowFilter] = useState(false);

	// View Details Modal states
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedLeave, setSelectedLeave] = useState(null);
	const [showApproveReasonModal, setShowApproveReasonModal] = useState(false);
	const [showRejectReasonModal, setShowRejectReasonModal] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [showRejectedResultModal, setShowRejectedResultModal] = useState(false);
	const [modalReason, setModalReason] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(7);

	// Filter popup state
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const filterRef = useRef(null);
	const navigate = useNavigate();

	const handleViewDetails = (leave) => {
		setSelectedLeave(leave);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedLeave(null);
		setShowApproveReasonModal(false);
		setShowRejectReasonModal(false);
		setShowSuccessModal(false);
		setShowRejectedResultModal(false);
		setModalReason("");
	};

	const handleApproveClick = () => setShowApproveReasonModal(true);
	const handleRejectClick = () => setShowRejectReasonModal(true);
	const filteredAndSortedLeaves = data
		// SEARCH by employee name
		.filter((leave) =>
			leave.name.toLowerCase().includes(searchTerm.toLowerCase()),
		)

		// FILTER by status
		.filter((leave) =>
			filterStatus === "All" ? true : leave.status === filterStatus,
		)

		// SORT by request date
		.sort((a, b) => {
			const dateA = new Date(a.requestDate);
			const dateB = new Date(b.requestDate);

			return sortOrder === "Newest" ? dateB - dateA : dateA - dateB;
		});

	useEffect(() => {
		const fetchMyTeamRA = async () => {
			try {
				const managerId = localStorage.getItem("current_user_id");
				const response = await apiClient.get("/api/myteamra", {
					headers: { "X-User-ID": managerId },
				});
				console.log("MyTeam RA Data:", response.data);
				setData(response.data);
			} catch (error) {
				console.error("Error fetching regularization data:", error);
			}
		};

		fetchMyTeamRA();
	}, []);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, filterStatus, attendanceType, sortOrder]);

	// Filter + Search + Sort
	const filteredAndSortedData = data
		.filter((item) =>
			item.name.toLowerCase().includes(searchTerm.toLowerCase()),
		)
		.filter((item) =>
			attendanceType === "All"
				? true
				: item.attendance?.toLowerCase().trim() ===
					attendanceType.toLowerCase().trim(),
		)
		.filter((item) =>
			filterStatus === "All"
				? true
				: item.status?.toLowerCase() === filterStatus.toLowerCase(),
		)
		.sort((a, b) => {
			const parseDate = (dateStr) => {
				if (!dateStr) return new Date(0);
				const parts = dateStr.split("-");
				if (parts.length === 3)
					return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
				return new Date(dateStr);
			};

			const dateA = parseDate(a.requestDate);
			const dateB = parseDate(b.requestDate);

			return sortOrder === "Newest" ? dateB - dateA : dateA - dateB;
		});

	const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);

	const paginatedData = filteredAndSortedData.slice(
		(currentPage - 1) * rowsPerPage,
		currentPage * rowsPerPage,
	);

	const handleApproveSubmit = async () => {
		if (selectedLeave) {
			try {
				const userId = localStorage.getItem("current_user_id");
				const userRole = localStorage.getItem("current_role") || "admin";

				await apiClient.put(
					`/api/admin/regularization/${selectedLeave.id}`,
					{ status: "Approved", reason: modalReason },
					{ headers: { "X-User-ID": userId, "X-User-Role": userRole } },
				);

				const currentUserName =
					localStorage.getItem("current_user_name") || "Admin";

				setData((prev) =>
					prev.map((item) =>
						item.id === selectedLeave.id
							? {
									...item,
									status: "Approved",
									approvedBy: item.approvedBy || currentUserName,
									approvalReason: modalReason,
								}
							: item,
					),
				);
			} catch (error) {
				console.error("Error approving regularization:", error);
			}
		}

		setShowApproveReasonModal(false);
		setShowSuccessModal(true);
		setTimeout(() => handleCloseModal(), 2000);
	};

	const handleRejectSubmit = async () => {
		if (selectedLeave) {
			try {
				const userId = localStorage.getItem("current_user_id");
				const userRole = localStorage.getItem("current_role") || "admin";

				await apiClient.put(
					`/api/admin/regularization/${selectedLeave.id}`,
					{ status: "Rejected", reason: modalReason },
					{ headers: { "X-User-ID": userId, "X-User-Role": userRole } },
				);

				const currentUserName =
					localStorage.getItem("current_user_name") || "Admin";

				setData((prev) =>
					prev.map((item) =>
						item.id === selectedLeave.id
							? {
									...item,
									status: "Rejected",
									approvedBy: item.approvedBy || currentUserName,
									rejectionReason: modalReason,
								}
							: item,
					),
				);
			} catch (error) {
				console.error("Error rejecting regularization:", error);
			}
		}

		setShowRejectReasonModal(false);
		setShowRejectedResultModal(true);
		setTimeout(() => handleCloseModal(), 2000);
	};

	return (
		<div className="ra-page">
			{/* Background Logo */}
			<div className="ra-bg-logo">
				<img src={group10} alt="logo" className="ra-bg-logo-img" />
			</div>

			<AdminSidebar />

			<div className="ra-main">
				<Topbar />

				<div className="ra-container">
					{/* Page Header */}
					<div className="ra-header">
						<h2 className="ra-title">Regularization Approval My Team</h2>

						<div className="ra-header-row">
							{/* Tabs */}
							<div className="ra-tabs">
								<button
									className="ra-tab"
									onClick={() => navigate("/regularization-approval")}
								>
									All
								</button>
								<button className="ra-tab active">My Team</button>
							</div>

							{/* Right Controls */}
							<div className="ra-controls">
								<div className="ra-search-wrapper">
									<FaSearch className="ra-search-icon-inside" />
									<input
										type="text"
										placeholder="Search..."
										className="ra-search"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
									/>
								</div>

								{/* FILTER WRAPPER */}
								<div className="ra-filter-wrapper" ref={filterRef}>
									<button
										className="ra-filter-btn"
										onClick={() => setShowFilter(!showFilter)}
									>
										<FaFilter /> Filter
									</button>

									{showFilter && (
										<div
											className="ra-modal"
											onClick={() => setShowFilter(false)}
										>
											<div
												className="ra-filter-card"
												onClick={(e) => e.stopPropagation()}
											>
												<h3 className="ra-filter-title">Filter</h3>

												<div className="ra-filter-grid">
													<div className="ra-filter-field">
														<label>Name</label>
														<input
															type="text"
															placeholder="Please enter name"
															value={searchTerm}
															onChange={(e) => setSearchTerm(e.target.value)}
														/>
													</div>

													<div className="ra-filter-field">
														<label>Attendance Type</label>
														<select
															value={attendanceType}
															onChange={(e) =>
																setAttendanceType(e.target.value)
															}
														>
															<option value="All">All</option>
															<option value="Present">Present</option>
															<option value="Absent">Absent</option>
														</select>
													</div>

													<div className="ra-filter-field">
														<label>Status</label>
														<select
															value={filterStatus}
															onChange={(e) => setFilterStatus(e.target.value)}
														>
															<option value="All">All</option>
															<option value="Pending">Pending</option>
															<option value="Approved">Approved</option>
															<option value="Rejected">Rejected</option>
														</select>
													</div>
												</div>

												<div className="ra-filter-actions">
													<button
														className="ra-reset-btn"
														onClick={() => {
															setSearchTerm("");
															setFilterStatus("All");
															setAttendanceType("All");
														}}
													>
														Reset
													</button>

													<button
														className="ra-apply-btn"
														onClick={() => setShowFilter(false)}
													>
														Apply
													</button>
												</div>
											</div>
										</div>
									)}
								</div>

								<select
									className="ra-sort"
									value={sortOrder}
									onChange={(e) => setSortOrder(e.target.value)}
								>
									<option value="Newest">Sort By : Newest</option>
									<option value="Oldest">Sort By : Oldest</option>
								</select>
							</div>
						</div>
					</div>

					{/* TABLE */}
					<div className="ra-table-card">
						<table className="ra-table">
							<thead>
								<tr>
									<th>Employee</th>
									<th>Regularization Date</th>
									<th>Attendance Type</th>
									<th>Date Of Request</th>
									<th>Action</th>
								</tr>
							</thead>

							<tbody>
								{paginatedData.map((emp) => (
									<tr key={emp.id}>
										<td>
											<div className="ra-emp">
												<img
													src={emp.img}
													alt={emp.name}
													className="ra-emp-img"
												/>
												<div className="ra-emp-text">
													<p className="ra-emp-name">{emp.name}</p>
													<span className="ra-emp-id">{emp.empId}</span>
												</div>
											</div>
										</td>

										<td className="ra-muted">{emp.regDate}</td>
										<td className="ra-muted">{emp.attendance}</td>

										<td>
											<div className="ra-request">
												<span className="ra-muted">{emp.requestDate}</span>
												<span
													className={`ra-status ${emp.status.toLowerCase()}`}
												>
													{emp.status}
												</span>
											</div>
										</td>

										<td>
											<button
												className="ra-view-btn"
												onClick={() => handleViewDetails(emp)}
											>
												View Details
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* PAGINATION */}
					<div className="ra-pagination">
						<div className="ra-showing">
							<span>Showing</span>
							<select
								className="ra-showing-select"
								value={rowsPerPage}
								onChange={(e) => {
									setRowsPerPage(Number(e.target.value));
									setCurrentPage(1);
								}}
							>
								{[7, 10, 15, 20].map((n) => (
									<option key={n} value={n}>
										{String(n).padStart(2, "0")}
									</option>
								))}
							</select>
						</div>

						<div className="ra-page-controls">
							<button
								className="ra-page-btn"
								onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
								disabled={currentPage === 1}
							>
								Prev
							</button>

							<button className="ra-page-number active">
								{String(currentPage).padStart(2, "0")}
							</button>

							<button
								className="ra-page-btn"
								onClick={() =>
									setCurrentPage((p) => Math.min(totalPages, p + 1))
								}
								disabled={currentPage === totalPages}
							>
								Next
							</button>
						</div>
					</div>
				</div>
			</div>
			{/* ── View Details Modal ── */}
			{isModalOpen && selectedLeave && (
				<div className="ra-modal-overlay">
					<div className="ra-modal-content">
						<div className="ra-modal-header">
							<h2>Regularization Approval</h2>
							<button className="ra-close-btn" onClick={handleCloseModal}>
								&times;
							</button>
						</div>

						<div className="ra-modal-body">
							<div className="ra-form-section">
								<div className="ra-form-group">
									<label>Employee ID:</label>
									<input
										type="text"
										value={`${selectedLeave.name} (${selectedLeave.empId})`}
										readOnly
									/>
								</div>

								<div className="ra-form-group">
									<label>Leave Type:</label>
									<select disabled className="ra-select">
										<option>
											{selectedLeave.regDate?.split("/")[1] || "Full Day"}
										</option>
									</select>
								</div>

								<div className="ra-form-group">
									<label>Select Date:</label>
									<div className="ra-date-input-wrapper">
										<input
											type="text"
											value={
												selectedLeave.regDate?.split("/")[0] || "DD-MM-YYYY"
											}
											readOnly
										/>
										<span className="ra-date-icon">📅</span>
									</div>
								</div>

								<div className="ra-form-group">
									<label>Attendance Type:</label>
									<input
										type="text"
										value={selectedLeave.attendance || ""}
										readOnly
									/>
								</div>

								<div className="ra-form-group">
									<label>Status:</label>
									<input
										type="text"
										value={selectedLeave.status || ""}
										readOnly
									/>
								</div>

								<div className="ra-form-group">
									<label>Approved By:</label>
									<input
										type="text"
										value={selectedLeave.approvedBy || "N/A"}
										readOnly
									/>
								</div>

								<div className="ra-form-group ra-reason-group">
									<label>Reason:</label>
									<div className="ra-reason-wrapper">
										<textarea value={selectedLeave.reason || ""} readOnly />
										<span className="ra-char-count">
											{selectedLeave.reason?.length || 0}/30
										</span>
									</div>
								</div>
							</div>

							<div className="ra-illustration-section">
								<img src={timemgnt} alt="Time Management" />
							</div>
						</div>

						<div className="ra-modal-footer">
							<span className="ra-watermark"></span>

							{selectedLeave.status &&
							selectedLeave.status.toLowerCase() === "pending" ? (
								<div className="ra-footer-btns">
									<button
										className="ra-approve-pill-btn"
										onClick={handleApproveClick}
									>
										Approve
									</button>

									<button
										className="ra-reject-pill-btn"
										onClick={handleRejectClick}
									>
										Reject
									</button>
								</div>
							) : null}
						</div>
					</div>
				</div>
			)}
			{showApproveReasonModal && (
				<div className="ra-modal-overlay ra-nested-overlay">
					<div className="ra-small-modal">
						<button
							className="ra-small-close"
							onClick={() => setShowApproveReasonModal(false)}
						>
							&times;
						</button>

						<h3>Reason For Approval</h3>

						<div className="ra-small-body">
							<textarea
								placeholder="Please fill out the note for approvals"
								value={modalReason}
								maxLength={250}
								onChange={(e) => setModalReason(e.target.value)}
							/>

							<p className="ra-char-hint">maximum character limit 250</p>

							<div className="ra-small-footer">
								<button className="ra-submit-btn" onClick={handleApproveSubmit}>
									Submit
								</button>

								<button
									className="ra-cancel-btn"
									onClick={() => setShowApproveReasonModal(false)}
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
			{showRejectReasonModal && (
				<div className="ra-modal-overlay ra-nested-overlay">
					<div className="ra-small-modal">
						<button
							className="ra-small-close"
							onClick={() => setShowRejectReasonModal(false)}
						>
							&times;
						</button>

						<h3>Reason For Rejection</h3>

						<div className="ra-small-body">
							<textarea
								placeholder="Please fill out the note for rejection"
								value={modalReason}
								maxLength={250}
								onChange={(e) => setModalReason(e.target.value)}
							/>

							<p className="ra-char-hint">maximum character limit 250</p>

							<div className="ra-small-footer">
								<button className="ra-submit-btn" onClick={handleRejectSubmit}>
									Submit
								</button>

								<button
									className="ra-cancel-btn"
									onClick={() => setShowRejectReasonModal(false)}
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
			{showSuccessModal && (
				<div className="ra-modal-overlay ra-nested-overlay">
					<div className="ra-result-modal ra-success-box">
						<button className="ra-small-close" onClick={handleCloseModal}>
							&times;
						</button>

						<div className="ra-result-content">
							<h2>Success</h2>
							<p>Leave Approved Successfully</p>
						</div>
					</div>
				</div>
			)}
			{showRejectedResultModal && (
				<div className="ra-modal-overlay ra-nested-overlay">
					<div className="ra-result-modal ra-reject-box">
						<button className="ra-small-close" onClick={handleCloseModal}>
							&times;
						</button>

						<div className="ra-result-content">
							<h2>Rejected</h2>
							<p>Leave Approval Rejected</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
