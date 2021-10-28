import Engine, { utils } from 'publicodes'
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { BasepathContext, EngineContext } from './contexts'

const { encodeRuleName } = utils

type RuleLinkProps<Name extends string> = Omit<
	React.ComponentProps<Link>,
	'to'
> & {
	dottedName: Name
	engine: Engine<Name>
	documentationPath: string
	displayIcon?: boolean
	currentEngineId?: number
	situationName?: string
	children?: React.ReactNode
}

export function RuleLink<Name extends string>({
	dottedName,
	engine,
	currentEngineId,
	documentationPath,
	displayIcon = false,
	children,
	...props
}: RuleLinkProps<Name>) {
	const rule = engine.getRule(dottedName)
	const newPath = documentationPath + '/' + encodeRuleName(dottedName)

	// There is a problem with this line of code : we loose the information
	// about the applicability of the formula. Besides, when we are not in the context of the
	// rules which defines the reference, we want to print a link to the parent rule and not
	// the value directly.

	// Besides, sometimes nodes don't have formula (which makes the doc page crash)

	// Furthermore, nothing prevent from using a type notification as a reference

	// For all these reason, I'm advocating for a change of perspective inside this notion of ruleWithDedicatedDocumentationPage

	// if (!ruleWithDedicatedDocumentationPage(rule)) {
	// 	return <Explanation node={engine.evaluate(rule.dottedName).formule} />
	// }
	if (!rule) {
		throw new Error(`Unknown rule: ${dottedName}`)
	}
	return (
		<Link
			to={
				newPath + (currentEngineId ? `?currentEngineId=${currentEngineId}` : '')
			}
			{...props}
		>
			{children || rule.title}{' '}
			{displayIcon && rule.rawNode.icônes && <span>{rule.rawNode.icônes}</span>}
		</Link>
	)
}

export function RuleLinkWithContext(
	props: Omit<RuleLinkProps<string>, 'engine' | 'documentationPath'> & {
		useSubEngine?: boolean
	}
) {
	const engine = useContext(EngineContext)
	if (!engine) {
		throw new Error('an engine should be provided in context')
	}
	const documentationPath = useContext(BasepathContext)
	const currentEngineIdFromUrl = new URLSearchParams(
		window.location.search
	).get('currentEngineId')
	const currentEngineId =
		props.useSubEngine !== false
			? engine.subEngineId ||
			  (currentEngineIdFromUrl ? Number(currentEngineIdFromUrl) : undefined)
			: undefined
	return (
		<RuleLink
			engine={engine}
			currentEngineId={currentEngineId}
			documentationPath={documentationPath}
			{...props}
		/>
	)
}
