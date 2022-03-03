const PageBodyContainer = (props) => {
	return (
		<div className={props.replaceClasses || props.pathName === '/' || props.pathName === '/realms' ? 'intro-screen' : 'min-h-screen grid grid-cols-12 gap-4 pb-44 pt-4'}>
			<div className={props.replaceClasses || props.pathName === '/' || props.pathName === '/realms' ? 'intro-screen__inner' : 'col-span-12 px-4 md:px-8 xl:px-4 xl:col-start-2 xl:col-span-10'}>{props.children}</div>
		</div>
	)
}

export default PageBodyContainer
