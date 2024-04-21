const productMapper = {
	['MobileVersion']: 'Youtube Mobile Clone',
	['DesktopVersion']: 'Youtube Desktop Clone',
	['DesktopVersionAndScript']:
		'Youtube Desktop Clone and Behavior Questions Script',
}

function sharedInfo() {
	return `
			<tr>
				<td>1</td>
				<td>YouTube Mobile Clone</td>
				<td>$1</td>
			</tr>
			<tr>
				<td>1</td>
				<td>Refund - YouTube Mobile Clone</td>
				<td>$-1</td>
			</tr>
			`
}

function getPrice(product, desktopSpecialOfferOver) {
	if (product === 'MobileVersion') {
		return 0
	}
	if (product === 'DesktopVersion') {
		if (desktopSpecialOfferOver) {
			return 50
		}
		return 29.99
	}
	// fall here only if add a script into a cart
	if (desktopSpecialOfferOver) {
		return 69.99
	}
	return 49.98
}

function getItem(product, desktopSpecialOfferOver) {
	if (product === 'MobileVersion') {
		return sharedInfo()
	}
	if (product === 'DesktopVersion') {
		if (desktopSpecialOfferOver) {
			return `
				${sharedInfo()}
					<tr>
						<td>1</td>
						<td style="padding-left:5px;padding-rigth:5px">${productMapper[product]}</td>
						<td>$50</td>
					</tr>
			`
		}
		return `
				${sharedInfo()}
				<tr>
					<td>1</td>
					<td style="padding-left:5px;padding-rigth:5px">${productMapper[product]}</td>
					<td>$29.99</td>
				</tr>
				`
	}
	// fall here only if add a script into a cart
	if (desktopSpecialOfferOver) {
		return `
				${sharedInfo()}
				<tr>
					<td>1</td>
					<td style="padding-left:5px;padding-rigth:5px">${
						productMapper['DesktopVersion']
					}</td>
					<td>$50</td>
				</tr>
				<tr>
					<td>1</td>
					<td style="padding-left:5px;padding-rigth:5px">${productMapper[product]}</td>
					<td>$19.99</td>
				</tr>
				`
	}
	return `
			${sharedInfo()}
			<tr>
				<td>1</td>
				<td style="padding-left:5px;padding-rigth:5px">${
					productMapper['DesktopVersion']
				}</td>
				<td>$29.99</td>
			</tr>
			<tr>
				<td>1</td>
				<td style="padding-left:5px;padding-rigth:5px">${productMapper[product]}</td>
				<td>$19.99</td>
			</tr>
			`
}

const sendProductToEmail = (email, product, desktopSpecialOfferOver) => {
	const dateTime = new Date()
	return `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Product Email</title>
    <style>
		.receipt-container {
			text-align:center;
			margin-top:20px;
			margin-bottom:20px;
			box-shadow: 0 3px 10px rgb(0 0 0 / 0.2);
		}
    </style>
  </head>

  <body class="">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed;background-color:#f9f9f9" id="bodyTable">
	<tbody>
		<tr>
			<td style="padding-right:10px;padding-left:10px;" align="center" valign="top" id="bodyCell">
				<table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperBody" style="max-width:600px">
					<tbody>
						<tr>
							<td align="center" valign="top">
								<table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableCard" style="background-color:#fff;border-color:#e5e5e5;border-style:solid;border-width:0 1px 1px 1px;">
									<tbody>
										<tr>
											<td style="background-color:rgb(245, 74, 77);font-size:1px;line-height:3px" class="topBorder" height="3">&nbsp;</td>
										</tr>
                    <!--
										<tr>
											<td style="padding-bottom: 20px;" align="center" valign="top" class="imgHero">
												<a href="#" style="text-decoration:none" target="_blank">
													<img alt="" border="0" src="http://email.aumfusion.com/vespro/img/hero-img/blue/heroGradient/user-account.png" style="width:100%;max-width:600px;height:auto;display:block;color: #f9f9f9;" width="600">
												</a>
											</td>
										</tr>
                    -->
										<tr>
											<td style="padding-top: 20px; padding-bottom: 5px; padding-left: 20px; padding-right: 20px;" align="center" valign="top" class="mainTitle">
												<h2 class="text" style="color:#000;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:28px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:36px;text-transform:none;text-align:center;padding:0;margin:0">Hi, <b>${email}</b></h2>
											</td>
										</tr>
										<tr>
											<td style="padding-bottom: 10px; padding-left: 20px; padding-right: 20px;" align="center" valign="top" class="subTitle">
												<h4 class="text" style="color:#999;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:16px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:24px;text-transform:none;text-align:center;padding:0;margin:0">Your Order: <b style="color:black">${
													productMapper[product]
												}</b>!</h4>
											</td>
										</tr>
										<tr>
											<td style="padding-left:20px;padding-right:20px" align="center" valign="top" class="containtTable ui-sortable">
												<table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableDescription" style="">
													<tbody>
														<tr>
															<td style="padding-bottom: 10px;" align="center" valign="top" class="description">
																<p class="text" style="color:#666;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:20px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:22px;text-transform:none;text-align:center;padding:0;margin:0">Thanks for purchasing this amazing item. We believe this could be your life changer!</p>
															</td>
														</tr>
													</tbody>
												</table>
												<table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableButton" style="">
													<tbody>
														<tr>
															<td align="center" valign="top">
																<table border="0" cellpadding="0" cellspacing="0" align="center">
																	<tbody>
																		<tr>
																			<td style="font-size: 25px;color:black" align="center" class="ctaButton"> 
                                        Please, check the attachment.
																			</td>
																		</tr>
																	</tbody>
																</table>
															</td>
														</tr>
													</tbody>
												</table>
											</td>
										</tr>
										<tr>
											<td align="center" valign="middle" class="emailRegards">
												<h1 style="font-size: 28px; margin:0">RECEIPT.</h1>
											</td>
										</tr>
										<tr class="receipt-container" style="padding-bottom:15px">
											<div style="text-align:center;margin-top:20px;margin-bottom:20px">
												<div>${dateTime.toLocaleDateString()}</div>
												<div>${dateTime.toLocaleTimeString() + ' PDT'}</div>
												<div style="border-bottom:1px dashed #000; margin:15px"></div>
											</div>
											<div>
												<table style="margin: 0 auto;color:black;text-align:center;padding-bottom:15px">
													<thead>
														<tr>
															<th>QTY</th>
															<th>ITEM</th>
															<th>AMT</th>
														</tr>
													</thead>
													<tbody>${getItem(product, desktopSpecialOfferOver)}</tbody>
													<tfoot>
														<tr>
															<td>Total</td>
															<td></td>
															<td>$${getPrice(product, desktopSpecialOfferOver)}</td>
														</tr>
													</tfoot>
												</table>
											</div>
										</tr>
									</tbody>
								</table>
								<table border="0" cellpadding="0" cellspacing="0" width="100%" class="space">
									<tbody>
										<tr>
											<td style="font-size:1px;line-height:1px" height="30">&nbsp;</td>
										</tr>
									</tbody>
								</table>
							</td>
						</tr>
					</tbody>
				</table>
				<table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperFooter" style="max-width:600px">
					<tbody>
						<tr>
							<td align="center" valign="top">
								<table border="0" cellpadding="0" cellspacing="0" width="100%" class="footer">
									<tbody>
										<tr>
											<td style="padding-top:10px;padding-bottom:10px;padding-left:10px;padding-right:10px" align="center" valign="top" class="socialLinks">
												<a href="#instagram-link" style="display: inline-block;" target="_blank" class="instagram">
													<img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/instagram.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
												</a>
											</td>
										</tr>
										<tr>
											<td style="padding: 10px 10px 5px;" align="center" valign="top" class="brandInfo">
												<p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">©&nbsp;Binary Bridges Inc. | 1121 Fedora | Los Angeles, CA 90006, USA.</p>
											</td>
										</tr>
										<tr>
											<td style="padding: 0px 10px 10px;" align="center" valign="top" class="footerEmailInfo">
												<p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">If you have any quetions please contact us <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">binarybridgeonline@gmail.com</a>
                        </p>
											</td>
										</tr>
										<tr>
											<td style="font-size:1px;line-height:1px" height="30">&nbsp;</td>
										</tr>
									</tbody>
								</table>
							</td>
						</tr>
						<tr>
							<td style="font-size:1px;line-height:1px" height="30">&nbsp;</td>
						</tr>
					</tbody>
				</table>
			</td>
		</tr>
	</tbody>
</table>
  </body>
</html>
`
}

export default sendProductToEmail
