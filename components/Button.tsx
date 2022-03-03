import { FunctionComponent } from 'react'
import Loading from './Loading'
import Tooltip from './Tooltip'

interface ButtonProps {
	className?: string
	isLoading?: boolean
	onClick?: () => void
	disabled?: boolean
	small?: boolean
	tooltipMessage?: string
	style?: any
	hideDefaults?: boolean
	href?: any
	target?: string
	title?: string
}

const Button: FunctionComponent<ButtonProps> = ({ children, className, disabled, isLoading, small, tooltipMessage = '', style, ...props }) => {
	return (
		<button className={`${className} default-transition font-bold px-4  ${small ? 'py-1' : 'py-2.5'} text-sm focus:outline-none ${disabled ? 'bg-bkg-4 cursor-not-allowed text-fgd-2' : 'bg-primary-light text-bkg-2 hover:bg-primary-dark'}`} {...props} style={style} disabled={disabled}>
			<Tooltip content={tooltipMessage}>
				<div>{isLoading ? <Loading /> : children}</div>
			</Tooltip>
		</button>
	)
}

export default Button

export const SecondaryButton: FunctionComponent<ButtonProps> = ({ children, onClick, disabled = false, className, isLoading, small = false, tooltipMessage = '', ...props }) => {
	return (
		<button onClick={onClick} disabled={disabled} className={`${className} border border-primary-light default-transition font-bold  px-4 ${small ? 'py-1' : 'py-2.5'} text-primary-light text-sm hover:border-primary-dark hover:text-primary-dark focus:outline-none disabled:border-fgd-3 disabled:text-fgd-3 disabled:cursor-not-allowed`} {...props}>
			<Tooltip content={tooltipMessage}>
				<div>{isLoading ? <Loading /> : children}</div>
			</Tooltip>
		</button>
	)
}

export const LinkButton: FunctionComponent<ButtonProps> = ({ children, onClick, disabled = false, className, hideDefaults, href, target, title, ...props }) => {
	return (
		href ? <a href={ href } title={ title } target={ target } onClick={ onClick } className={`${className ? className + (hideDefaults ? '' : ' ') : ''}${hideDefaults ? '' : 'border-0 default-transition text-sm underline hover:no-underline hover:opacity-60 focus:outline-none'}`} {...props}>
			{children}
		</a> : <button onClick={ onClick } title={ title } disabled={disabled} className={`${className ? className + (hideDefaults ? '' : ' ') : ''}${hideDefaults ? '' : 'border-0 default-transition text-sm underline hover:no-underline hover:opacity-60 focus:outline-none'}`} {...props}>
			{children}
		</button>
	);
}


export const NavButton = (props) => {

	return (
		<LinkButton { ...props } className={`nav-button w-full flex items-start items-center py-2 hover:text-primary-dark focus:outline-none${ props.className ? " " + props.className : ""}`} hideDefaults={ true }>
			{ props.selectionkey && <span className="flex-shrink-0 mr-2 nav-button__hover-highlight">
				&lt; <span dangerouslySetInnerHTML={{__html: (props.selectionkey || " ") }}/> &gt;
			</span> }
			{ props.children && <>
				{ props.htmlString ? <span dangerouslySetInnerHTML={{__html: (props.children || "Lorem ipsum") }}/> : <span className="flex items-center">
					{ props.children  }
				</span> }
			</> }
		</LinkButton>
	);
}
